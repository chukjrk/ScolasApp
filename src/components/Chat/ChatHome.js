import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import { firebaseRef } from '../../services/Firebase'
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
// import Icon from 'react-native-vector-icons/Ionicons'
import { observer,inject } from 'mobx-react/native'
import { Header, Icon } from 'react-native-elements'
import Swipeable from 'react-native-swipeable';

@inject("appStore") @observer
export default class ChatHome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      isFinished: false,
      counter: 30,
      isEmpty: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => true}),
    }
    this.data = []
    const uid = this.props.appStore.user.uid
    console.log("--------- MY CHATS --------- " + this.props.appStore.chat_count)
    firebaseRef.database().ref('user_chats/'+ uid +'/posts').orderByChild('updatedAt').limitToLast(this.state.counter).on('child_added',
    (snapshot) => {
      console.log("--------->>>> CHAT ADDED ");
      this.data.unshift( {id: snapshot.key, postData: snapshot.val()} )
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.data)
      })
      this.setState({ isLoading: false })
    })
    firebaseRef.database().ref('user_chats/'+ uid +'/posts').orderByChild('updatedAt').limitToLast(this.state.counter).on('child_changed',
    (snapshot) => {
      console.log("--------->>>> CHAT CHANGED TWICE, very weird bug !!!");
      this.data = this.data.filter((x) => x.id !== snapshot.key)
      this.data.unshift({id: snapshot.key, postData: snapshot.val()})
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.data)
      })
    })
  }

  componentDidMount() {
    console.log("--------- MY CHATS --------- ")
    if (this.props.appStore.chat_count === 0) {
      this.setState({ isEmpty: true })
      this.setState({ isLoading: false })
    }
  }

  componentDidUpdate() {
  }

  render() {
    console.log("MY CHAT RENDERING AGAIN!!!");
    return (
      <View style={styles.container}>
        <StickyHeaderFooterScrollView 
          renderStickyHeader={() => (
          <Header 
          centerComponent={{ text: 'MESSAGES', style: { color: '#fff', fontSize: 20 } }}
          outerContainerStyles= {{ backgroundColor: '#27924a'}}
          />
        )}>
        
        <ListView
          automaticallyAdjustContentInsets={true}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          //onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
          />
        </StickyHeaderFooterScrollView>
      </View>

    )
  }

  _renderRow = (data) => {
    const timeString = moment(data.postData.updatedAt).fromNow()
    const newMessageCounter = data.postData.new_messages ?
      <View style={styles.CounterContainer}><Text style={styles.counter}>{ data.postData.new_messages }</Text></View>
    : null
    return (
      <Swipeable
        rightButtons={[
          <TouchableOpacity style={[styles.rightSwipeItem, {backgroundColor: 'pink'}]} onPress={() => this._flagPost(data.postData)}>
            <Icon style={[styles.flagicon]} name='flag' color='white' />
          </TouchableOpacity>,
          // onRightButtonsOpenRelease={onOpen}
          // onRightButtonsCloseRelease={onClose}
      ]}>
      <TouchableOpacity onPress={() => this._openChat(data.postData)}>
        <View style={styles.card}>
          <View style={styles.content}>
            <View style={styles.HeaderContainer}>
              <Text style={styles.title}>{ data.postData.title }</Text>
              <Text style={styles.author}>{ data.postData.username }</Text>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.HeaderContainer}>
              <Text style={styles.info}>{timeString}</Text>
              { newMessageCounter }
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
    )
  }

  _onEndReached = () => {
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 10 })
      this.setState({ isLoading: true })
      firebaseRef.database().ref('user_chats/'+ this.props.appStore.user.uid +'/posts').off()
      firebaseRef.database().ref('user_chats/'+ this.props.appStore.user.uid +'/posts').orderByChild('updatedAt').limitToLast(this.state.counter+10).on('value',
      (snapshot) => {
        console.log("---- USER CHATS RETRIEVED ----");
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          this.setState({ isFinished: true })
          console.log("---- USER CHATS FINISHED !!!! ----")
        }
        if (snapshot.val()) {
          console.log(this.state.counter);
          this.setState({ isEmpty: false })
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
          })
        }
        this.setState({ isLoading: false })
      })
    }
  }

  _flagPost = (postData) => {
    console.log("--------> FLAG !!!!!!")
    console.log(postData)
    Alert.alert(
      'Flag Confirmation',
      'Flag this item for unreceived books? If yes, a moderator will decide within 24 hours if this item should be removed and points fixed.',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Yes', onPress: () => {

          firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/flagged?').update({
            flagged: 'true',
          })

          // fetch('https://onesignal.com/api/v1/notifications',
          // {
          //   method: 'POST',
          //   headers: {
          //     'Accept': 'application/json',
          //     "Content-Type": "application/json; charset=utf-8", //required, set by onsignal
          //     "Authorization": "Basic NGEwMGZmMjItY2NkNy0xMWUzLTk5ZDUtMDAwYzI5NDBlNjJj",
          //   },
          //   body: JSON.stringify(
          //   {
          //     app_id: "e09d00d9-b019-471d-ab1a-17ada2fdcda2",
          //     included_segments: ["All"],
          //     headings: {"en": "🏴🏴🏴🏴 Item flaged! 🏴🏴🏴🏴"},
          //     android_sound: "fishing",
          //     data: postData,
          //     big_picture: postData.image,
          //     ios_sound: "fishing.caf",
          //     contents: {"en": this.props.appStore.user.displayName + " just flaged: " + postData.title + " for " + postData.price},
          //     filters: [{"field":"tag","key":"username","relation":"=","value":""}], // point notification to booxchange username notuf should come to account
          //   })
          // })
          .then((responseData) => {
            console.log("Push POST:" + JSON.stringify(responseData));
          })
          .done()

         } },
      ]
    )
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
          <Text>- Here will be the list of your chats -</Text>
        </View>
      )
    }
  }

  _openChat = (postData) => {
    this.props.navigation.navigate('Chat',{ title:postData.title, puid:postData.puid, uid:this.props.appStore.user.uid, wantToBuy:true });
  }

  componentWillUnmount() {
    firebaseRef.database().ref('user_chats/'+ this.props.appStore.user.uid +'/posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingLeft: 19,
    // paddingRight: 16,
    // paddingVertical: 12,
    // flexDirection: 'row'
  },
  RawContainer: {
    flexDirection: 'row',
    flex: 1,
    //borderWidth: 1,
  },
  LeftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    //borderWidth: 1,
  },
  RightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    //borderWidth: 1,
  },
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  CounterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth: 1,
    height: 18,
    width: 18,
    borderRadius: 90,
    marginRight: 25,
    backgroundColor: 'red',
  },
  counter: {
    fontSize: 16,
    fontWeight: '200',
    color: '#FFF',
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#d6d7da',
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderColor: '#dddddd',
    margin: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    color: '#444',
  },
  author: {
    fontSize: 16,
    padding: 5,
    marginRight: 15,
  },
  info: {
    padding: 3,
    fontSize: 13,
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20
  },
  flagicon: {
    alignItems: 'flex-start',
  }

})
