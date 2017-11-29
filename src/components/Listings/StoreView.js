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
  RefreshControl
} from 'react-native'
import { StackNavigator, NavigationActions  } from 'react-navigation'
import { RkText, RkButton, RkStyleSheet, RkTextInput } from 'react-native-ui-kitten';
import _ from 'lodash';
import moment from 'moment';
import { SearchBar } from 'react-native-elements'
import { firebaseRef } from '../../services/Firebase'
import Chat from '../../components/Chat/Chat'
import Book from '../Listings/Book'
import { observer,inject } from 'mobx-react/native';

const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class StoreView extends Component {

  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      usertype: false,
      counter: 1,
      isLoading: true,
      isEmpty: false,
      isFinished: false,
      searchText: '',
      refreshing: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }

    this._setSearchText = this._setSearchText.bind(this)
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

  _setSearchText() {
    const searchText = this.state.searchText
    this.setState({ isLoading: true })
    if (searchText == ""){
      firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
      (snapshot) => {
        if (snapshot.val()) {
          this.setState({ isEmpty: false })
          this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
        }
        else {
          this.setState({ isEmpty: true })
        }
        this.setState({ isLoading: false })
      })
    } else {
      this.setState({refreshing: true});
      firebaseRef.database().ref('posts').orderByChild('createdAt').equalTo(searchText).limitToLast(this.state.counter).on("value", 
      (snapshot) => {
        if (snapshot.val()) {
          this.setState({ isEmpty: false }) 
          this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
        } 
        else {
          this.setState({ isEmpty: true })
        }
        this.setState({ isLoading: false })
        this.setState({refreshing: false});
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          value={this.state.searchText}
          // onChangeText={this._setSearchText.bind(this)}
          onChangeText={(text) => this.setState({searchText: text})}
          placeholder='Search Books' 
          lightTheme
          clearIcon 
          onSubmitEditing={() => this._setSearchText()}
          returnKeyType= "go" />
        <ListView
          automaticallyAdjustContentInsets={false}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
          // refreshControl= {
            //< RefreshControl
              // refreshing={this.state.refreshing} 
              // onRefresh= {this.setSearchText.bind(this)} />
          // } 
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
      url: "http://scolas.shop/post/" + data.puid,
      subject: "Share this item"
    }
    const BuyButton = (data.status === 'available') ?
            <TouchableOpacity style={styles.button} onPress={() => this._BookPage(data)}>
              <RkText>Here</RkText>
            </TouchableOpacity>
          : null
    const Status = ( data.status === 'available') ? <Text style={{fontWeight:'bold',color:"green"}}>{data.status.toUpperCase()}</Text> : null
    data.status === 'sold' ? firebaseRef.database().ref('posts').child(data.puid).remove() : null
    
    return (
      <TouchableWithoutFeedback onPress={() => this._BookPage(data)}>
        <View style={styles.card}>
          <Image
            source={{ uri:data.image }}
            resizeMode='contain'
            style={{
              height: 150,
              width: 120,
              alignSelf: 'flex-start',
            }}
          />
        
          <View style={styles.postInfo}>
            <Text style={styles.title}>{ data.title }</Text>
            <Text style={{fontStyle: 'italic'}}>{data.Author}</Text>
            <Text style={styles.info}><Text style={styles.bold}>{data.username}</Text> - {timeString}</Text>
{/*            { data.text ? <Text style={styles.info}>{ data.text }</Text> : null }*/}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _BookPage = (postData) => {
      this.props.navigation.navigate('Book',{ title:postData.title, puid:postData.puid, uid:postData.uid});

    //Since that Chat navigator in router.js was using StackNavigator,  this.props.navigation.navigate required to
    // handle navigation
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
    flex: 0.2,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#d6d7da'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#444',
  },
  postInfo: {
    padding: 5,
    // alignItems: 'center',
  },
  postButtons: {
    padding: 5,
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
    alignSelf: 'flex-start'
  },
  info: {
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
})
