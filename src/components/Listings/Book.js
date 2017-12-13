import React, { Component } from 'react'
import {View, Button, Container, Content, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
import _ from 'lodash';
import moment from 'moment';
import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'
import firebase from 'firebase'
import BackgroundTask from 'react-native-background-task'
// import base from "re-base";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  Alert,
  TouchableWithoutFeedback, 
  AsyncStorage,
} from 'react-native'


const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class Book extends Component {
  static navigationOptions = {
    headerTitleStyle: {
      alignSelf: 'center',
      paddingRight: 56,
    },
  };
  
  constructor(props) {
    super(props);
    this.state = {
      product: {},
      activeSlide: 0,
      quantity: 1,
      postProps: {},
      status: ""
    };

    this.props.appStore.current_page = 'book'
    this.props.appStore.current_puid = this.props.navigation.state.params.puid
  }

  componentWillMount() {
    firebaseRef.database().ref('posts').child(this.props.navigation.state.params.puid).once('value',
    (snapshot) => {
      //console.log(snapshot.val())
      // Actions.refresh({title: snapshot.val().title})
      this.setState({
                      status:snapshot.val().status,
                      clientName:snapshot.val().clientName,
                      postProps: snapshot.val(),
                    })
      if (snapshot.val().image) {
        this.setState({
          product: {
            _id: 1,
            title: snapshot.val().title,
            description: snapshot.val().text,
            createdAt: snapshot.val().createdAt,
            user: {
              _id: snapshot.val().uid,
              name: snapshot.val().username,
            },
            image: snapshot.val().image,
          }
        })
      }
    })
  }

  render(data) {
    // const height = screenWidth*data.imageHeight/data.imageWidth
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        <Content>
          <Image
            source={{ uri:this.state.postProps.image }}
            resizeMode='contain'
            style={{
              height: 480,
              width: screenWidth,
              alignSelf: 'center',
              paddingTop: 5,
            }}
          />
          <View style={{backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center'}}>
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 18, alignSelf: 'center', fontWeight: 'bold', color: 'black'}}>{this.state.postProps.title}</Text>
              </Col>
            </Grid> 
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 16, fontStyle: 'italic'}}> - {this.state.postProps.Author}</Text>
              </Col>
            </Grid>
            
            <View style={{marginTop: 15, padding: 10, borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}>
              <NBText style={{marginBottom: 5}}>Description</NBText>
              <View style={{width: 50, height: 1, backgroundColor: 'rgba(44, 62, 80, 0.5)', marginLeft: 7, marginBottom: 10}} />
              <Text note>
                {this.state.postProps.text}
              </Text>
            </View>

            <Grid style={{marginTop: 15}}>
              <Col size={3}>
                <Button block onPress={() => this._onBuyConfirm(data)} style={{backgroundColor: '#25a1e0'}}>
                  <Text style={{color: "#fdfdfd", marginLeft: 5}}>PURCHASE</Text>
                </Button>
              </Col>
            </Grid>
          </View>
        </Content>
      </Container>
    )
  }

  _openChat = () => {
    if (this.props.appStore.user.uid == this.state.postProps.uid) {
      seller_id = this.props.appStore.user.uid
    } else {
      buyer_id = this.props.appStore.user.uid
      this.props.navigation.navigate('Chat',{ title:this.state.postProps.title, puid:this.state.postProps.puid, uid:this.props.appStore.user.uid, wantToBuy:true});
      console.log('puid', this.state.postProps.puid)
      console.log('uid', this.props.appStore.user.uid)
    }
  }

  _onBuyConfirm = () => {
    if (this.props.appStore.user.uid == this.state.postProps.uid) {
      seller_id = this.props.appStore.user.uid
    } else {
      Alert.alert(
        'Order Confirmation',
        'Are you sure you want to purchase this item?',
        [
          { text: 'No', onPress: () => {}, style: 'cancel' },
          { text: 'Yes', onPress: () => { this._onBuy(), this._openChat() }},
        ]
      )
    }
  }

  static runSendNotification(uid){
    firebaseRef.database().ref('users').child(uid).once('value')
    .then((snapshot) => {

      fetch('https://onesignal.com/api/v1/notifications',
      { method: 'POST',
      headers: { "Content-Type": "application/json; charset=utf-8", //required, set by onsignal
                "Authorization": "Basic NGEwMGZmMjItY2NkNy0xMWUzLTk5ZDUtMDAwYzI5NDBlNjJj" }, //required, set by onsignal
      body: JSON.stringify ({
        // changed app_id value if own onesignal app_id
        app_id: "e09d00d9-b019-471d-ab1a-17ada2fdcda2",
        // set what to display in notification
        contents: {"en": "Have you received your book?"},
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

      //run the nofitication. This.constructor.function works if function called has static with it.
      //commented. uncomment if want notification pop up in foreground after user click buy item.
          // this.constructor.runSendNotification(this.props.appStore.user.uid);

      // Start and schedule BackgroundTask. See react-native-background-task docs for how to set specific schedule
      // like run after 30 minutes or etcetra
      BackgroundTask.schedule({period: 15});


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

  renderImages() {
    let images = [];
    this.state.postProps.image.map((img, i) => {
      images.push(
          <TouchableWithoutFeedback
            key={i}
            onPress={() => this.openGallery(i)}
          >
            <Image
              source={{uri: img}}
              style={{width: Dimensions.get('window').width, height: 350}}
              resizeMode="cover"
            />
          </TouchableWithoutFeedback>
      );
    });
    return images;
  }

  openGallery(pos) {
    Actions.imageGallery({images: this.state.product.images, position: pos});
  }

//******
// Other books connected to that book *************************************************
//******

  // renderSimilairs() {
  //   let items = [];
  //   let stateItems = this.state.product.similarItems;
  //   for(var i=0; i<stateItems.length; i+=2 ) {
  //     if(stateItems[i+1]) {
  //       items.push(
  //         <Grid key={i}>
  //           <ProductComponent key={stateItems[i].id} product={stateItems[i]} />
  //           <ProductComponent key={stateItems[i+1].id} product={stateItems[i+1]} isRight />
  //         </Grid>
  //       );
  //     }
  //     else {
  //       items.push(
  //         <Grid key={i}>
  //           <ProductComponent key={stateItems[i].id} product={stateItems[i]} />
  //           <Col key={i+1} />
  //         </Grid>
  //       );
  //     }
  //   }
  //   return items;
  // }

  


//******
// Make the Watchlist notification idea
//******


  // addToWishlist() {
  //   var product = this.state.product;
  //   var success = true;
  //   AsyncStorage.getItem("WISHLIST", (err, res) => {
  //     if(!res) AsyncStorage.setItem("WISHLIST",JSON.stringify([product]));
  //     else {
  //       var items = JSON.parse(res);
  //       if(this.search(items, product)) {
  //         success = false
  //       }
  //       else {
  //         items.push(product);
  //         AsyncStorage.setItem("WISHLIST",JSON.stringify(items));
  //       }
  //     }
  //     if(success) {
  //       Toast.show({
  //         text: 'Product added to your wishlist !',
  //         position: 'bottom',
  //         type: 'success',
  //         buttonText: 'Dismiss',
  //         duration: 3000
  //       });
  //     }
  //     else {
  //       Toast.show({
  //         text: 'This product already exist in your wishlist !',
  //         position: 'bottom',
  //         type: 'danger',
  //         buttonText: 'Dismiss',
  //         duration: 3000
  //       });
  //     }
  //   });
  // }

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
