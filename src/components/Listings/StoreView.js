import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  ListView,
  Alert,
} from 'react-native'
import { StackNavigator, } from 'react-navigation'

import { RkText, RkButton, RkStyleSheet, RkTextInput } from 'react-native-ui-kitten';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import moment from 'moment';
// import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'
import { NavigationActions } from 'react-navigation';
import Chat from '../../components/Chat/Chat'


const screenWidth = Dimensions.get('window').width

export default class StoreView extends Component {

  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      counter: 1,
      isLoading: true,
      isEmpty: false,
      isFinished: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    console.log("--------- TIMELINE --------- " + this.state.counter)
    firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
    (snapshot) => {
      console.log("---- TIMELINE POST RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
      }
      else {
        this.setState({ isEmpty: true })
      }
      this.setState({ isLoading: false })
    })
  }

  componentDidUpdate() {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          automaticallyAdjustContentInsets={false}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
        />
      </View>
    )
  }

  _renderRow = (data) => {
    //console.log("TIMELINE :::: _renderRow " + data.title)
    const timeString = moment(data.createdAt).fromNow()
    const height = screenWidth*data.imageHeight/data.imageWidth
    const shareOptions = {
      title: data.title + " for sale",
      url: "http://myapp.shop/post/" + data.puid,
      subject: "Share this item"
    }
    const BuyButton = (data.status === 'available') ?
            <TouchableOpacity style={styles.button} onPress={() => this._BuyNow(data)}>
              <RkText>Here</RkText>
            </TouchableOpacity>
          : null
    const Status = (data.status === 'available') ? <Text style={{fontWeight:'bold',color:"green"}}>{data.status.toUpperCase()}</Text> : <Text style={{fontWeight:'bold',color:"red"}}>{data.status.toUpperCase()}</Text>
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{ data.title }</Text>
        <TouchableWithoutFeedback style={styles.postImage} onPress={() => this._openChat(data)}>
          <Image
            source={{ uri:data.image }}
            resizeMode='contain'
            style={{
              height: height,
              width: screenWidth,
              alignSelf: 'center',
            }}
          />
        </TouchableWithoutFeedback>
        <View style={styles.postInfo}>
          <Text style={styles.info}><Text style={styles.bold}>{data.price}</Text></Text>
          { Status }
          <Text style={styles.info}><Text style={styles.bold}>{data.username}</Text> - {timeString}</Text>
          { data.text ? <Text style={styles.info}>{ data.text }</Text> : null }
        </View>
        <View style={styles.postButtons}>
          { BuyButton }
          <TouchableOpacity style={styles.button} onPress={()=> this._flagPost(data)}>
            <RkText>No. 2</RkText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={()=>{ Share.open(shareOptions) }}>
            <RkText>No. 3</RkText>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _flagPost = (postData) => {
    console.log("--------> FLAG !!!!!!")
    console.log(postData)
    Alert.alert(
      'Flag Confirmation',
      'Are you sure you want to flag this item? If yes, a moderator will decide within 24 hours if this item should be removed.',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Yes', onPress: () => {

          fetch('https://onesignal.com/api/v1/notifications',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': this.props.appStore.onesignal_api_key,
            },
            body: JSON.stringify(
            {
              app_id: this.props.appStore.onesignal_app_id,
              included_segments: ["All"],
              headings: {"en": "🏴🏴🏴🏴 Item flaged! 🏴🏴🏴🏴"},
              android_sound: "fishing",
              data: postData,
              big_picture: postData.image,
              ios_sound: "fishing.caf",
              contents: {"en": this.props.appStore.user.displayName + " just flaged: " + postData.title + " for " + postData.price},
              filters: [{"field":"tag","key":"username","relation":"=","value":"Herve f"}],
            })
          })
          .then((responseData) => {
            console.log("Push POST:" + JSON.stringify(responseData));
          })
          .done()

         } },
      ]
    )
  }

  _openChat = (postData) => {
    console.log(" *************** Opening CHAT ROOM *************** " + postData.puid);
    Actions.chat({ title:postData.title, puid:postData.puid })
  }

  _BuyNow = (postData) => {
    //  Actions.chat({ title:postData.title, puid:postData.puid, wantToBuy:true })

    //Since that Chat navigator in router.js was using StackNavigator,  this.props.navigation.navigate required to
    // handle navigation
    this.props.navigation.navigate('Chat',{ title:postData.title, puid:postData.puid, uid:postData.uid , wantToBuy:true });
  }


  _onEndReached = () => {
    //console.log("TIMELINE ----> _onEndReached :+++:");
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 1 })
      this.setState({ isLoading: true })
      firebaseRef.database().ref('posts').off()
      firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter+1).on('value',
      (snapshot) => {
        this.setState({ isFinished: false })
        console.log("---- TIMELINE POST ON END RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          console.log("---- TIMELINE POST FINISHED ----");
          this.setState({ isFinished: true })
        }
        if (snapshot.val()) {
          this.setState({ isEmpty: false })
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
          })
        }
        this.setState({ isLoading: false })
      })
    }
  }

  _renderFooter = () => {
    if (this.state.isLoading) {
      return (
        <View style={styles.waitView}>
          <ActivityIndicator size='large'/>
        </View>
      )
    }
    if (this.state.isEmpty) {
      return (
        <View style={styles.waitView}>
          <Text>Nothing there yet.</Text>
        </View>
      )
    }
  }

  componentWillUnmount() {
    console.log("---- TIMELINE UNMOUNT ---")
    firebaseRef.database().ref('posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    padding: 5,
    color: '#444',
  },
  postImage: {
    backgroundColor: '#eee',
  },
  postInfo: {
    padding: 3,
    alignItems: 'center',
  },
  postButtons: {
    padding: 5,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  button: {
    flex: 3,
    padding: 5,
    margin: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    backgroundColor: '#4285f4',
  },
  info: {
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
})
