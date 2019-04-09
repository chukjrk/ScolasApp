import React, { Component } from 'react';
import {
	TouchableOpacity,
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	Dimensions,
} from 'react-native'
import { observer,inject } from 'mobx-react/native'
import { Button } from 'react-native-elements'
import { StackNavigator, NavigationActions } from 'react-navigation'
import { firebaseRef } from '../../services/Firebase'
import firebase from 'firebase'
import stripe from 'tipsi-stripe';
import Moment from 'react-moment';

stripe.setOptions({
  publishableKey: 'pk_test_Kt0xEhtPWyoHgMUjKsphNXKh',
  androidPayMode: 'test', // change for "production"
});

@inject("appStore") @observer
export default class Shipping extends Component {
	static navigationOptions = {
    // title: `${navigation.state.params.title}`,
    title: 'BooXchange',
    headerTitleStyle: {
      alignSelf: 'flex-start',
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
      disabled:false,
      total_payment: 0,
    };

    this.props.appStore.current_page = 'shipping'
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
      			imageWidth: snapshot.val().imageWidth
      		}
      	})
      }
  	})

    this.setState({total_payment: ((this.state.postProps.price + 8.00 + 2.25)*100)})

    const user_id= firebaseRef.auth().currentUser.uid;
    firebaseRef.database().ref('/users').child(user_id).once('value',
      (snapshot) => {
        this.props.appStore.address = snapshot.val().line1
        this.props.appStore.fullname = snapshot.val().fullname
      })
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
          fullname: this.props.appStore.fullname,
          line1: this.props.appStore.address,
          city: this.props.appStore.city,
          state: this.props.appStore.state_us,
          postalCode: this.props.appStore.zip, 
          phone: this.props.appStore.phone_number, 
        }
      )

      // get seller_uid and set it to app.Store.seller_uid
      this.props.appStore.seller_uid = this.props.navigation.state.params.uid

      firebaseRef.database().ref('user_posts/'+this.state.postProps.uid+'/posts').child(this.props.navigation.state.params.puid).update({
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        status: 'sold',
        clientId: this.props.appStore.uid,
        clientName: this.props.appStore.username,
      })
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
            if (playerId != this.props.appStore.user.uid) {
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
          }
        }
        else {
          firebaseRef.database().ref('messages_notif').child(this.props.navigation.state.params.puid).set({include_player_ids: [this.props.appStore.user.uid]})
        }
      })
    }
  }
  

	requestPayment = () => {
		return stripe
		.paymentRequestWithCardForm()
		.then(stripeTokenInfo => {
			console.warn('Token created', { stripeTokenInfo });
		    firebaseRef.database().ref('/stripe_customers/' + firebaseRef.auth().currentUser.uid + '/charges').push({
		      source: stripeTokenInfo.tokenId,
		      amount: 100
		    });
		})
		.catch(error => {
			console.warn('Payment failed', { error });
		});
	};

	render() {
		const screenWidth = Dimensions.get('window').width
		const height = ((screenWidth-275)*this.state.postProps.imageHeight/this.state.postProps.imageWidth)
		const date = new Date();
    const shippingcost = 8.00;
    const servicefees = 2.25;
    const total = shippingcost + servicefees + this.state.postProps.price
		return (
			<ScrollView style={styles.root}>
				<Button
					// buttonStyle={}
					containerStyle={{marginTop: 32}}
					// containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
					activeOpacity={0.8}
					title={'Ship Book'}
					onPress={this._handleShip}
					titleStyle={styles.loginTextButton}
					raised={true}
					/>
				<View style={[styles.container, {flexDirection: 'row'}]}>
					<Image
            source={{ uri:this.state.postProps.image }}
            resizeMode='contain'
            style={{
              height: height,
              width: height,
              alignSelf: 'flex-start',
              paddingTop: 5,
            }}
          />
          <View style={{flexWrap: 'wrap'}}>
						<Text style={[styles.segmentsShip, {fontWeight: 'bold'}]}>{this.state.postProps.title}</Text>
						<Text style={styles.segmentsShip}>Rental Period: {this.state.postProps.period} </Text>
					</View>
				</View> 

				{/*<Text style={styles.headers}> Payment Information </Text>
				<View style={styles.container}>
					<View style={styles.segmentBorder}> 
					<TouchableOpacity style={styles.segments}> 
						<Text style={{fontSize:15, fontWeight: 'bold'}}>Payment Method </Text>
						<Text style={{fontSize:16}}>Visa ending in 7635 </Text>
					</TouchableOpacity>
					</View>
					<View>
					<TouchableOpacity style={styles.segments}>
						<Text style={{fontSize:15, fontWeight: 'bold'}}>Billing Address </Text>
						<Text style={{fontSize:16}}>Chukwuebuka Kemdirim {this.props.appStore.fullname} {'\n'}
						328 N Riverside ST, AMES, IA, 50011{this.props.appStore.address} </Text>
					</TouchableOpacity>
					</View>
				</View>*/}

				<Text style={styles.headers}> Shipping Details </Text>

				<View style={styles.container}>
					<TouchableOpacity style={styles.segmentBorder} onPress={() => this.props.navigation.navigate('ShippingAddress')}>
						<View style={styles.segments}>
							<Text style={{fontSize:15, fontWeight: 'bold'}}>Shipping Address</Text>
							<Text style={{fontSize:16}}> {this.props.appStore.fullname} {'\n'} {this.props.appStore.address} </Text>
						</View>
					</TouchableOpacity>
					<View style={styles.segments}>
						<Text style={{fontSize:16}}> Get it by: <Moment style={{fontSize:16}} element={Text} add={{ days: 7 }} format="ddd DD MMM YYYY" >{date}</Moment></Text>
						<Text style={{fontSize:13}}> Standard Shipping 5-7 Days </Text>
					</View>
				</View>

				<View style={styles.shippingcontainer}>
					<Text style={styles.segmentsShip}> Shipping to: {this.props.appStore.fullname}</Text>
					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
						<Text style={styles.segmentsShip}> Rental: </Text>
						<Text style={styles.segmentsShipNumber}> ${this.state.postProps.price} </Text>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
						<Text style={styles.segmentsShip}> Shipping: </Text>
						<Text style={styles.segmentsShipNumber}> ${shippingcost} </Text>
					</View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.segmentsShip}> Service fees: </Text>
            <Text style={styles.segmentsShipNumber}> ${servicefees} </Text>
          </View>
				</View>
				<View style={styles.container}>
					<View style={styles.segments}>
						<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
							<Text style={[styles.segmentsShip, {fontWeight: 'bold'}]}> Order Total: </Text>
							<Text style={[styles.segmentsShipNumber, {fontWeight: 'bold'}]}> ${total} </Text>
						</View>
					</View>
				</View>
				<Button
					buttonStyle={styles.buttondeliver}
					containerStyle={{marginTop: 32}}
					// containerViewStyle={{borderRadius: 25, color: 'green' }}
					activeOpacity={0.8}
					title={'Ship Book'}
					onPress={this.requestPayment(), this._onBuy()}
					// titleStyle={styles.loginTextButton}
					raised={true}
					/>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create ({
	root: {
		flex: 1,
		paddingTop: 15,
		// backgroundColor: '#f0f0f0'
	},
	container: {
		// flex: 1,
		borderWidth: 1,
		borderRadius: 5,
		margin: 10,
		marginBottom: 20,
		borderColor: '#f0f0f0',
		shadowColor: '#000',
		backgroundColor: '#fff',
	},
	shippingcontainer: {
		// flex: 1,
		borderWidth: 1,
		borderRadius: 5,
		marginHorizontal: 10,
		marginBottom: 5,
		borderColor: '#f0f0f0',
		shadowColor: '#000',
		backgroundColor: '#fff',
	},
	buttonDeliver: {
		color: 'green',
		marginBottom: 40
	},
	segmentBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	segments: {
		justifyContent: 'center',
		alignContent: 'center',
		margin: 10,
		marginVertical: 15
	},
	headers: {
		fontSize: 20,
		fontWeight: 'bold',
		left: 5
	},
	segmentsShip: {
		alignSelf: 'flex-start',
		marginHorizontal: 10,
		marginVertical: 2,
		fontSize: 16
	},
	segmentsShipNumber: {
		alignSelf: 'flex-end',
		marginHorizontal: 10,
		marginVertical: 2,
		fontSize: 16
	}
})
