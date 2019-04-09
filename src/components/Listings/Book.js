import React, { Component } from 'react'
import {View, Button, Container, Content, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
import _ from 'lodash';
import moment from 'moment';
import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'
import firebase from 'firebase'
import Carousel from 'react-native-snap-carousel';
import SliderEntry from './SliderEntry';
import { sliderWidth, itemWidth } from '../../styles/SliderEntry.style';
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
    // title: `${navigation.state.params.title}`,
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
      status: "",
      disabled:false
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
            price: snapshot.val().price,
            period: snapshot.val().period,
            user: {
              _id: snapshot.val().uid,
              name: snapshot.val().username,
            },
            image: snapshot.val().image,
            imageHeight: snapshot.val().imageHeight,
          }
        })
      }
    })
  }
  _renderItem ({item, index}) {
    return <SliderEntry data={item} even={(index + 1) % 2 === 0} />;
  }

  render(data) {
    // const height = screenWidth*data.imageHeight/data.imageWidth
    firebaseRef.database().ref('users/' + this.props.appStore.user.uid).once('value')
    .then(snapshot => {
        if(snapshot.val().user_point == 0){
          this.setState({
              disabled: true
          });
        }else{
          this.setState({
              disabled: false
          });
        }
      });

    return(
      <Container style={{backgroundColor: '#e6e7e7'}}>
        <Content>
          <View style={{paddingTop: 5, alignItems: 'center', margin: 10}}>
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 20, alignSelf: 'flex-start', fontWeight: 'bold', color: 'black'}}>{this.state.postProps.title}</Text>
              </Col>
            </Grid>
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 16, fontStyle: 'italic', alignSelf: 'flex-start'}}> - {this.state.postProps.Author}</Text>
              </Col>
            </Grid>
          </View>
          {/*<Image
            source={{ uri:this.state.postProps.image }}
            resizeMode='contain'
            style={{
              height: 300,
              width: screenWidth,
              alignSelf: 'center',
              marginTop: 5,
              position: absolute
            }}
          />*/}
          <Carousel
            data={this.state.postProps.image}
            renderItem={this._renderItem}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            // itemHeight={height}
            layout={'stack'}
            layoutCardOffset={18}
            loop={true}
            />
          <Text style={styles.price}> ${this.state.postProps.price}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoSection}>
              <NBText style={{marginBottom: 5, alignSelf: 'center'}}>Description</NBText>
              <View style={styles.descriptionCon} />
              <Text note style={{alignSelf: 'center', fontSize: 16}} >
                {this.state.postProps.text}
              </Text>
            </View>
            <View style={styles.renterInfo}>
              <Text style={styles.renterText}> Renter:</Text>
              <Text style={{fontSize: 16, alignSelf: 'flex-end',  padding: 10}}>{this.state.postProps.username} </Text> 
            </View>
            <View style={styles.renterInfo}>
              <Text style={styles.renterText}> Rental Period: </Text> 
              <Text style={{fontSize: 16, alignSelf: 'flex-end',  padding: 10}}>{this.state.postProps.period} </Text> 
            </View>
            <Grid style={{marginTop: 15}}>
              <Col size={3}>
                {/*<Button block onPress={this.props.navigation.navigate('Shipping') }*/}
                {/*<Button block onPress={() => this._onBuyConfirm(data)}*/}
                <Button block onPress={() => this._openChat()}
                  style={this.state.disabled == true
                    ? {backgroundColor: '#707070'} : {backgroundColor: '#25a1e0'}}
                  disabled = {this.state.disabled}>
                  <Text style={{color: "#fdfdfd", marginLeft: 5}}>RENT</Text>
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
      this.props.navigation.navigate('Shipping',{ 
        title:this.state.postProps.title, 
        puid:this.state.postProps.puid, 
        uid:this.props.appStore.user.uid, 
        wantToBuy:true
      });
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
    })
  }

  static deletePost(data) {
    firebaseRef.database().ref('posts').child(data).remove()
  }

  // _Test(){
  //   console.log("--------------------Task running -------")
  //   BackgroundTask.schedule({period: 900});
  // }

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

      // Deduct Points per each purchase
      firebaseRef.database().ref('users/' + this.props.appStore.user.uid).once('value')
      .then(snapshot => {
          var get_total = snapshot.val().user_point - 1
          firebaseRef.database().ref('users')
          .child(this.props.appStore.user.uid).update( { user_point : get_total } )
      });

      //*****************************************************************************************************
      // New change for point exchange to be added upon purchase
      // Buyer will be able to flag seller if they do not receive their books
      //*****************************************************************************************************
      firebaseRef.database().ref('users/' + this.props.appStore.seller_uid).once('value')
      .then(snapshot => {
          var get_total = snapshot.val().user_point + 1
          firebaseRef.database().ref('users')
          .child(this.props.appStore.seller_uid).update( { user_point : get_total } )
      });
      //******************************************************************************************************
      // End
      //******************************************************************************************************

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
              firebaseRef.database().ref('users').child(this.props.appStore.seller_uid).once('value')
              .then((snapshot) => {
                console.log("PUSHING NOTIFICATION !!! " + this.props.navigation.state.params.title);
                fetch('https://onesignal.com/api/v1/notifications',
                {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': "Basic NGEwMGZmMjItY2NkNy0xMWUzLTk5ZDUtMDAwYzI5NDBlNjJj",
                  },
                  body: JSON.stringify(
                  {
                    app_id: "e09d00d9-b019-471d-ab1a-17ada2fdcda2",
                    include_player_ids: [snapshot.val().device_id],
                    android_sound: "fishing",
                    ios_sound: "fishing.caf",
                    data: {"puid":this.props.navigation.state.params.puid, "new_message":true},
                    headings: {"en": "Sold"},
                    contents: {"en": this.props.appStore.user.displayName + " just bought your book, " +  this.state.postProps.title},
                  })
                })
                .then((responseData) => {
                  //console.log("Push POST:" + JSON.stringify(responseData))
                })
                .catch((errorData) => {
                  console.log("Push ERROR:" + JSON.stringify(errorData))
                })
                .done()
              })
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
    flex: 1,
    backgroundColor: '#e6e7e7'
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
  infoSection:{
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    backgroundColor: '#fdfdfd'
  },
  renterInfo: {
    width: screenWidth-17,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'rgba(149, 165, 166, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fdfdfd'
  },
  renterText: {
    fontSize: 16, 
    alignSelf: 'flex-start', 
    padding: 10, 
    fontWeight: 'bold'
  },
  infoContainer: {
    backgroundColor: '#e6e7e7', 
    paddingTop: 10, 
    paddingBottom: 10, 
    paddingLeft: 12, 
    paddingRight: 12, 
    alignItems: 'center'
  },
  descriptionCon: {
    width: screenWidth-40,
    height: 1,
    backgroundColor: 'rgba(44, 62, 80, 0.5)',
    marginLeft: 7, 
    marginBottom: 10
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white', 
    fontStyle: 'italic', 
    alignSelf: 'flex-end',
    backgroundColor: '#27924a',
    // width: 100,
    // height: 100,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 50,
    paddingRight: 30,
    transform: [
      {scaleX: 2}
    ],
    padding: 3
  }
})
