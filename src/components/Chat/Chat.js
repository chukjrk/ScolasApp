import React, { Component } from 'react'
import {
  Text,
  TextInput,
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
//import { getColor } from '../components/config'
import { firebaseRef } from '../../services/Firebase'
import firebase from 'firebase'
import { Icon } from 'react-native-elements'
// import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { observer,inject } from 'mobx-react/native'
import { Actions } from 'react-native-router-flux'
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import Lightbox from 'react-native-lightbox'
import Spinner from 'react-native-loading-spinner-overlay'
import BackgroundTask from 'react-native-background-task'

const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      postProps: {},
      status: "",
      clientName: "",
      spinnervisible: true,
    }
    this.renderActions = this.renderActions.bind(this)
    this.props.appStore.current_page = 'chat'
    this.props.appStore.current_puid = this.props.navigation.state.params.puid
    //changed this.props.uid to this.props.navigation.state.params.puid because using Chat stacknavigator in router.js
    // same goes to puid/wantToBuy
  }

  componentWillMount() {

    console.log("---- CHAT WILL MOUNT ----- " + this.props.navigation.state.params.puid)
    firebaseRef.database().ref('posts').child(this.props.navigation.state.params.puid).once('value',
    (snapshot) => {
      // commented because Actions.refresh make error. Not sure whether the library make caused.
      // Actions.refresh({title: snapshot.val().title})
      this.setState({
                      status:snapshot.val().status,
                      clientName:snapshot.val().clientName,
                      postProps: snapshot.val(),
                    })
      if (snapshot.val().image) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, {
              _id: 1,
              text: snapshot.val().title,
              createdAt: new Date(snapshot.val().createdAt),
              user: {
                _id: snapshot.val().uid,
                name: snapshot.val().username,
              },
              image: snapshot.val().image,
            }),
          }
        })
      }
      if (snapshot.val().text) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, {
              _id: 3,
              text: snapshot.val().text,
              createdAt: new Date(snapshot.val().createdAt),
              user: {
                _id: snapshot.val().uid,
                name: snapshot.val().username,
              },
            }),
          }
        })
      }
    })
    if (this.props.navigation.state.params.wantToBuy) {
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, {
            _id: 4,
            text: "Use this chat to communicate with the owner of the item and click on the BUY button when you are ready to make the purchase. Once you click on this button, this item will be reserved to you. First-click, first served.",
            createdAt: new Date(),
            user: {
              _id: 0,
              name: "Scolas",
              // avatar: 'https://raw.githubusercontent.com/jsappme/react-native-firebase-starter/wip/graphics/myapp-48.png',
            },
          }),
        }
      })
    }
    this._loadMessages((message) => {
      this.setState((previousState) => {
        //console.log(previousState.messages)
        return {
          messages: GiftedChat.append(previousState.messages, message),
        }
      })
    })
    setTimeout(() => {
      this.setState({ spinnervisible: false })
    }, 1200)
  }

  _loadMessages(callback) {
    console.log("---------- LOAD MESSAGES ---------- " + this.props.navigation.state.params.puid)
    const onReceive = (data) => {
      const message = data.val()
      console.log(":::::::: onReceive :: " + message.text)
      setTimeout(() => {
        console.log("-------------- RESETTING NEW MESSAGES -------------- " + this.props.navigation.state.params.puid);
        this.props.appStore.new_messages = 0
        firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).update( { new_messages:0 } )
      }, 2000)
      callback({
        _id: data.key,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {
          _id: message.user._id,
          name: message.user.name,
        },
      })
    }
    firebaseRef.database().ref('messages').child(this.props.navigation.state.params.puid).limitToLast(20).on('child_added', onReceive)
    console.log("-------------- RESETTING NEW MESSAGES -------------- " + this.props.navigation.state.params.puid);
    this.props.appStore.new_messages = 0
    firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).update( { new_messages:0 } )
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    //console.log("---------------------------------- componentDidUpdate ---------------------------------")
  }

  _onBuyConfirm = () => {
    Alert.alert(
      'Order Confirmation',
      'Are you sure you want to purchase this item?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        { text: 'Yes', onPress: () => { this._onBuy() } },
      ]
    )
  }

// this function will process the nofitication. static used for
// to access function from other outside class.
  static runSendNotification(uid){
    firebaseRef.database().ref('users').child(uid).once('value')
    .then((snapshot) => {

      fetch('https://onesignal.com/api/v1/notifications',
      { method: 'POST',
      headers: { "Content-Type": "application/json; charset=utf-8", //required, set by onsignal
                "Authorization": "Basic NGEwMGZmMjItY2NkNy0xMWUzLTk5ZDUtMDAwYzI5NDBlNjJj" }, //required, set by onsignal
      body: JSON.stringify ({
        // changed app_id value if own onesignal app_id
        app_id: "67bdeb03-7db4-4cf5-95b6-616d0530e030",
        // set what to display in notification
        contents: {"en": "Have you received your item?"},
        // this include_player_ids will target user with notification. Can add more target users
        include_player_ids: [snapshot.val().device_id],
        // Custom action buttons. IOS can add more to 3 buttons. See react-native-onesignal docs for more info
        buttons: [{"id": "id1", "text": "Yes", "icon": "ic_menu_share"},
        {"id": "id2", "text": "No", "icon": "ic_menu_send"}],
      })
      }).then((response) => response.json())
        .then((responseJson) => {
          //execute something after fetch executed
          console.log(responseJson.action.actionID);

        });
    }
  )

  }

  _onBuy = () => {
    if (this.state.status === 'available') {
      console.log("AVAILABLE")
      this.setState({
                      status: 'sold',
                      clientName: this.props.appStore.username,
                    })
      firebaseRef.database().ref('posts').child(this.props.navigation.state.params.puid).update(
        {
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
          status: 'sold',
          clientId: this.props.appStore.uid,
          clientName: this.props.appStore.username,
        }
      )

      // get seller_uid and set it to app.Store.seller_uid
      this.props.appStore.seller_uid = this.props.navigation.state.params.uid

      //run the nofitication. This.constructor.function work if function called have static with it.
      //commented. uncomment if want notification pop up in foreground after user click buy item.
          // this.constructor.runSendNotification(this.props.appStore.user.uid);

      // Start and schedule BackgroundTask. See react-native-background-task docs for how to set specific schedule
      // like run after 30 minutes or etcetra
      BackgroundTask.schedule();


      firebaseRef.database().ref('user_posts/'+this.state.postProps.uid+'/posts').child(this.props.navigation.state.params.puid).update(
        {
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
          status: 'sold',
          clientId: this.props.appStore.uid,
          clientName: this.props.appStore.username,
        }
      )
      this.props.appStore.order_count = this.props.appStore.order_count + 1
      firebaseRef.database().ref('users').child(this.props.appStore.user.uid).update({ order_count: this.props.appStore.order_count })
      firebaseRef.database().ref('user_orders/'+this.props.appStore.user.uid+'/posts').child(this.state.postProps.puid).set(this.state.postProps)
      firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).once('value')
      .then((snapshot) => {
        console.log("player_ids: ");
        console.log(snapshot.val());
        if (snapshot.val()) {
          snapshot.val().include_player_ids.map((playerId) => {
            console.log("+-------> " + playerId)
            firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).update(
              {
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                status: 'sold',
                clientId: this.props.appStore.uid,
                clientName: this.props.appStore.username,
              }
            )
            if (playerId != this.props.appStore.user.uid) {
              firebaseRef.database().ref('user_chats/'+playerId+'/posts').child(this.props.navigation.state.params.puid).transaction(
                (post) => {
                  if (post) {
                    post.status = 'sold'
                    post.clientId = this.props.appStore.uid
                    post.clientName = this.props.appStore.username
                    post.updatedAt = firebase.database.ServerValue.TIMESTAMP
                    post.new_messages++
                  }
                  return post
                }
              )
              console.log("PUSHING NOTIFICATION !!! " + this.props.navigation.state.params.title);
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
                  android_sound: "fishing",
                  ios_sound: "fishing.caf",
                  data: {"puid":this.props.navigation.state.params.puid, "new_message":true},
                  headings: {"en": "Sold"},
                  contents: {"en": this.props.appStore.user.displayName + " just bought " +  this.state.postProps.title},
                  filters: [{"field":"tag","key":"uid","relation":"=","value":playerId}],
                })
              })
              .then((responseData) => {
                //console.log("Push POST:" + JSON.stringify(responseData))
              })
              .catch((errorData) => {
                console.log("Push ERROR:" + JSON.stringify(errorData))
              })
              .done()
            }
          })
          if (snapshot.val().include_player_ids.indexOf(this.props.appStore.user.uid) === -1) {
            const playerIds = snapshot.val().include_player_ids
            playerIds.push(this.props.appStore.user.uid)
            console.log("ADDDDDING NEW PLAYER to " + this.props.navigation.state.params.puid);
            console.log(playerIds)
            firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).set({include_player_ids: playerIds})
            firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).set(this.state.postProps)
            this.props.appStore.chat_count = this.props.appStore.chat_count + 1
            firebaseRef.database().ref('users').child(this.props.appStore.user.uid).update( {chat_count: this.props.appStore.chat_count} )
          }
        }
        else {
          firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).set({include_player_ids: [this.props.appStore.user.uid]})
        }
      })
    }
  }

  _onSend = (messages = []) => {
    for (let i = 0; i < messages.length; i++) {
      firebaseRef.database().ref('posts').child(this.props.navigation.state.params.puid).update( {updatedAt: firebase.database.ServerValue.TIMESTAMP} )
      firebaseRef.database().ref('messages').child(this.props.navigation.state.params.puid).push({
        text: messages[i].text,
        user: messages[i].user,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
      firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).once('value')
      .then((snapshot) => {
        console.log("player_ids: ");
        console.log(snapshot.val());
        if (snapshot.val()) {
          snapshot.val().include_player_ids.map((playerId) => {
            console.log("+-------> " + playerId)
            firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).update({ updatedAt: firebase.database.ServerValue.TIMESTAMP })
            if (playerId != this.props.appStore.user.uid) {
              firebaseRef.database().ref('user_chats/'+playerId+'/posts').child(this.props.navigation.state.params.puid).transaction(
                (post) => {
                  if (post) {
                    post.new_messages++
                    post.updatedAt = firebase.database.ServerValue.TIMESTAMP
                  }
                  return post
                }
              )
              console.log("PUSHING NOTIFICATION !!! " + this.props.navigation.state.params.title);
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
                  android_sound: "fishing",
                  ios_sound: "fishing.caf",
                  data: {"puid":this.props.navigation.state.params.puid, "new_message":true},
                  headings: {"en": "New message from " + this.props.appStore.user.displayName},
                  contents: {"en": messages[i].text },
                  filters: [{"field":"tag","key":"uid","relation":"=","value":playerId}],
                })
              })
              .then((responseData) => {
                //console.log("Push POST:" + JSON.stringify(responseData))
              })
              .catch((errorData) => {
                console.log("Push ERROR:" + JSON.stringify(errorData))
              })
              .done()
            }
          })
          console.log(snapshot.val().include_player_ids)
          if (snapshot.val().include_player_ids.indexOf(this.props.appStore.user.uid) === -1) {
            const playerIds = snapshot.val().include_player_ids
            playerIds.push(this.props.appStore.user.uid)
            console.log("ADDDDDING NEW PLAYER to " + this.props.navigation.state.params.puid);
            console.log(playerIds)
            firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).set({include_player_ids: playerIds})
            firebaseRef.database().ref('user_chats/'+this.props.appStore.user.uid+'/posts').child(this.props.navigation.state.params.puid).set(this.state.postProps)
            this.props.appStore.chat_count = this.props.appStore.chat_count + 1
            firebaseRef.database().ref('users').child(this.props.appStore.user.uid).update( {chat_count: this.props.appStore.chat_count} )
          }
        }
        else {
          firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).set({include_player_ids: [this.props.appStore.user.uid]})
        }
      })
    }
  }

  componentWillUnmount() {
    console.log("---- CHAT UNMOUNT ---")
    this.props.appStore.current_page = ''
    this.props.appStore.current_puid = ''
    firebaseRef.database().ref('messages').child(this.props.navigation.state.params.puid).off()
    //firebaseRef.database().ref('posts').child(this.props.puid).off()
  }

  renderFooter = (props) => {
      const Footer = (this.state.status === 'sold') ?
        <View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{fontWeight:'bold', color: '#3367d6', marginBottom: 7, }}>
            - Sold to { this.state.clientName } -
          </Text>
        </View>
      :
        null
      return Footer
  }

  renderAccessory = (props) => {
      const Accessory = (this.state.status === 'available') ?
        <View style={ styles.chatControl }>
          <TouchableOpacity onPress={ this._onBuyConfirm }>
            <View style={ styles.btnContainer }>
              <Text style={ styles.btnText }>{ 'Buy this item'.toUpperCase() }</Text>
            </View>
          </TouchableOpacity>
        </View>
      :
      <View style={ styles.chatControl }>
        <View style={ styles.btnContainer }>
          <Text style={ styles.btnText }>SOLD</Text>
        </View>
      </View>
      return Accessory
  }

  renderActions(props) {
        return (
          <TouchableOpacity>
            <Icon name='event' resizeMode={'center'}/>
          </TouchableOpacity>
        );
    }

  renderLightboxContent = (props) => {
    return (
            <Image
              source={{ uri:this.state.postProps.image }}
              resizeMode='contain'
              style={{
                marginTop:60,
                width: screenWidth,
                height: this.state.postProps.imageHeight,
              }}
            />
          )
  }

  renderMessageImage = (props) => {
    return (
             <View>
              <Lightbox renderContent={this.renderLightboxContent}>
                <Image
                  source={{ uri:props.currentMessage.image }}
                  style={{
                          width: 250,
                          height: 150,
                          borderRadius: 13,
                          margin: 3,
                          resizeMode: 'cover',
                        }}
                />
              </Lightbox>
            </View>
          )
  }

  render() {
    const Chat = (this.state.status === 'available') && (this.props.appStore.user.uid != this.props.navigation.state.params.uid) ?
                  <GiftedChat
                    messages={this.state.messages}
                    onSend={this._onSend}
                    user={{
                      _id: this.props.appStore.user.uid,
                      name: this.props.appStore.username,
                    }}
                    renderMessageImage={this.renderMessageImage}
                    renderFooter={this.renderFooter}
                    renderAccessory={this.renderAccessory}
                  />
                :
                  <GiftedChat
                    messages={this.state.messages}
                    onSend={this._onSend}
                    user={{
                      _id: this.props.appStore.user.uid,
                      name: this.props.appStore.username,
                    }}
                    renderMessageImage={this.renderMessageImage}
                    renderFooter={this.renderFooter}
                    renderActions={this.renderActions}
                  />
    return (
            <View style={{marginTop:56,flex:1,}}>
            <Spinner visible={this.state.spinnervisible} />
              { Chat }
            </View>
          )
  }
}

const styles = StyleSheet.create({
  chatControl: {
    flex: 1,
  },
  btnContainer: {
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  btnText: {
    fontWeight: '800',
    fontSize: 20,
   // color: getColor()
  }
})
