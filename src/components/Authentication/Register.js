import React, { Component } from 'react';
import { View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	AsyncStorage,
	KeyboardAvoidingView
} from 'react-native';
import { firebaseRef } from '../../services/Firebase';
import { observer, inject } from 'mobx-react/native';
import Login from './Login'
import OneSignal from 'react-native-onesignal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import branch from 'react-native-branch'

// ------------------------------------------------------------------------------------------------------
// branch should read link if downloaded through a link
branch.subscribe(({ error, params }) => {
	if (error) {
		console.log("------Branch Error-----")
		console.log('Error from Branch: ' + error)
		return
	}
	// set the refferred_by parameter for each user with a linked invitation
	console.log("------Branch Accessed-----")

	referrerUid = params.$canonical_identifier
	// let installParams = await branch.getFirstReferringParams() // params from original installoero
	// params will never be null if error is null
	console.log('- Values from Params UUid-', params.$canonical_identifier)
	console.log('- Values from Params printed whole -', params)
})

@inject("appStore") @observer
export default class Register extends Component {
	static navigationOptions = {
    title: 'REGISTRATION', // to add letter spacing on Android
    headerTitleStyle: {
    	alignSelf: 'center',
    	paddingRight: 56,
    	justifyContent: 'space-between',
    },
    headerStyle: {
    	backgroundColor: 'rgb(51,204,102)',
    	shadowOpacity: 0
    },
    headerTintColor: 'white'
	};

	constructor(props) {
		super(props)

		this.state = {
			name: '',
			email: '',
			password: '',
			verifyPassword: '',
			school: '',
			wordStatus: null,
			emailStatus: 1,
     		errorMessage: null,
     		referred_by: '',
		}

		this._register = this._register.bind(this)
		// this.unsubscriber = null;
	}

	// ------------------------------------------------------------------------------------------------------
	// function for signing up user from referral link
	// createAnonymousAccountWithReferrerInfo(refferalUid){
	// 	console.log('createAnonymousAccountWithReferrerInfo')
	// 	firebaseRef.auth().signInAnonymously().then(() => {
	// 		firebaseRef.auth().onAuthStateChanged((user) => {
	// 			if (user) {
	// 				// User is signed in.
	// 				isAnonymous = user.isAnonymous;
	// 				user = firebaseRef.auth().currentUser
	// 				// ...
	// 			} else {
	// 			  	// User is signed out
	// 			}
	//   		});  
	// 	}).catch(function(error) {
	// 	  	// Handle Errors here.
	// 	  	console.log('--- referrer clap code', error.code);
	// 	  	console.log('--- referrer error message', error.message);
	// 	});
	// }

	//------------------------------------------------------------------------------------------------------------------------------
	// referral reward function called when user registers if referred through branch link
	//-----------------------------------------------------------------------------------------------------------------------------
	rewardReferrals(){
		// let installParams = await branch.getFirstReferringParams()
		// console.log('Values form installparams printed whole', installParams)
		firebaseRef.database().ref('users').child(referrerUid).once('value')
		.then(snapshot => {
			var get_total = snapshot.val().user_point + 0.2
			firebaseRef.database().ref('users').child(referrerUid)
			.update( { user_point : get_total } )
		});		
	}
	//-------------------------------------------------------------------------------------------------------

	_register() {
		if (this.state.email.includes('.edu')) {
			this.setState({ errorMessage: null })
			if (this.state.password == this.state.verifyPassword) {
				this.setState({ wordStatus: null})
				firebaseRef.database().ref('usernameList').child(this.state.name.toLowerCase()).once('value')
				.then((snapshot) => {
					if (snapshot.val()){
					} else {
						firebaseRef.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
						.then((user) => {
							user.sendEmailVerification().then(() => {
							firebaseRef.database().ref('usernameList').child(this.state.name.toLowerCase()).set(user.uid)
  							user.updateProfile({displayName: this.state.name})
  							.then(() => {
  								// this.setState({emailStatus: 0})
  								//Get device_id using OneSignal.getPermissionSubscriptionState() and registered it to firebase
  								OneSignal.getPermissionSubscriptionState((status) => {
  									const uid = user.uid
	  								const username = user.displayName
	  								const post_count = 0
	  								const chat_count = 0
	  								const order_count = 0
	  								const email = user.email
	  								const user_point = 0 //added and set user_point default to 1
	  								const device_id = status.userId // added
	  								// const refferred_by = this.state.referrerUid

	  								firebaseRef.database().ref('users/' + user.uid)
	  								.set({
	  									uid,
	  									username,
	  									post_count,
	  									chat_count,
	  									order_count,
	  									email,
	  									user_point,
	  									device_id,
	  									// referred_by
	  								})

	  								this.props.appStore.uid = user.uid
		  							this.props.appStore.username = user.displayName
		  							this.props.appStore.post_count = post_count
		  							this.props.appStore.order_count = order_count
		  							this.props.appStore.chat_count = chat_count
		  							this.props.appStore.user = user
		  							this.props.appStore.user_point = user_point
		  							OneSignal.sendTag("uid", user.uid)

		  							console.log("------------get the data from input fields or set the default-----------------")
		  							console.log("username: " + user.displayName)
		  							console.log("post_count: " + post_count)
		  							console.log("order_count: " + order_count)
		  							console.log("chat_count: " + chat_count)
		  							console.log("user: " + user)
		  							console.log("user1: " + user.displayName)
		  							console.log("user2: " + user.email)
		  							console.log("user3: " + user.photoURL)
		  							console.log("user4: " + user.emailVerified)
		  							console.log("user5: " + user.uid)
		  							console.log("user_point: " + user_point)

		  							console.log("--------------------After save in appstore, then load back data in appstore-----------------")
		  							console.log("username:" + this.props.appStore.username)
		  							console.log("post_count:" + this.props.appStore.post_count)
		  							console.log("order_count:" + this.props.appStore.order_count)
		  							console.log("chat_count:" + this.props.appStore.chat_count)
		  							console.log("user:" + this.props.appStore.user)
		  							console.log("user1:" + this.props.appStore.user.displayName)
		  							console.log("user2:" + this.props.appStore.user.email)
		  							console.log("user3:" + this.props.appStore.user.photoURL)
		  							console.log("user4:" + this.props.appStore.user.emailVerified)
		  							console.log("user5:" + this.props.appStore.user.uid)
		  							console.log("user_point:" + this.props.appStore.user_point)		  							
  								});
								console.log("------Branch Haead-----")
								if (referrerUid){
									this.rewardReferrals()
								}
  							});
							})
							this.props.navigation.navigate('VerifyMessage')
						}) .catch(function(error) {
							//Handle Errors here.
							console.log(error.code)
							console.log(error.message)
							// ...
	            var eChange = error.message
	            eChange.toString()
						})
					}
				})
			} else {
				console.log("Passwords do not match");
      	this.setState({ wordStatus: 'Passwords do not match'})
			}
		} else {
			this.setState({errorMessage: 'Email must be a school email (e.g .edu)'})
		}
	}

	render() {
		//const Name = this.state.name;
		const { navigate } = this.props.navigation;

		return (
			<KeyboardAwareScrollView style={styles.container}>
    		<Text style={{color: 'red', fontSize: 13}}>{this.state.wordStatus}</Text>
    		<Text style={{color: 'red', fontSize: 13}}>{this.state.errorMessage}</Text>
				<Text style={styles.title}> User Details </Text>
				<TextInput
					placeholder = "NAME"
					placeholderTextColor= "rgba(255,255,255,0.7)"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({name: text})}
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.SecondInput.focus(); }} />

				<TextInput
					ref = 'ThirdInput'
					placeholder = "SCHOOL"
					placeholderTextColor= "rgba(255,255,255,0.7)"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({school: text})}
					autoCapitalize= "none"
					underlineColorAndroid= "transparent"
					autoCorrect={false}
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.FourthInput.focus(); }}/>

				<Text style={styles.title}> Account Details </Text>

				<TextInput
					ref = 'SecondInput'
					placeholder = "EMAIL"
					placeholderTextColor= "rgba(255,255,255,0.7)"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({email: text})}
					keyboardType= "email-address"
					autoCapitalize= "none"
					underlineColorAndroid= "transparent"
					autoCorrect={false}
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.ThirdInput.focus(); }}/>

				<TextInput
					ref = 'FourthInput'
					placeholder = "PASSWORD"
					placeholderTextColor= "rgba(255,255,255,0.7)"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({password: text})}
					secureTextEntry = {true}
					underlineColorAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.FifthInput.focus(); }} />

				<TextInput
					ref = 'FifthInput'
					placeholder = "CONFIRM PASSWORD"
					placeholderTextColor= "rgba(255,255,255,0.7)"
					returnKeyType= "go"
					onChangeText={(text) => this.setState({verifyPassword: text})}
					secureTextEntry = {true}
					underlineColorAndroid= "transparent"
					style={styles.input} />


				<TouchableOpacity style={styles.buttonContainer} onPress={this._register}>
					<Text style={styles.buttonText}>CREATE ACCOUNT</Text>
				</TouchableOpacity>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgb(51,204,102)',
		// backgroundColor: '#01579B',
		padding: 20
	},

	input: {
		height: 40,
		backgroundColor: 'rgba(1, 87, 155, 0.2)',
		marginBottom: 10,
		color: '#FFF',
		paddingHorizontal: 10,
		fontSize: 15
	},

	buttonContainer: {
		backgroundColor: '#34495e',
		paddingVertical: 10
	},

	buttonText: {
		textAlign: 'center',
		color: '#FFFFFF',
		fontWeight: '700'
	},

	title: {
		color: 'white',
		alignSelf: 'center',
		paddingBottom: 10,
		fontSize: 15,
		// fontSize: 35,
		// fontWeight: 'bold'
	},

	titleWrapper: {
		justifyContent: 'center',
		flex:1
	}
});
