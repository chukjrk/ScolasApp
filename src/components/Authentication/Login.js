import React, { Component } from 'react';
import { View,
 Text,
 StyleSheet,
 TextInput,
 TouchableOpacity,
 AsyncStorage,
 KeyboardAvoidingView,
 Image
} from 'react-native';
import { firebaseRef } from '../../services/Firebase'
import Profile from '../Profile/Profile'
import OneSignal from 'react-native-onesignal';

export default class Login extends Component {
	constructor(props) {
		super(props)

		this.state = {
			email: '',
			password: '',
			status: '',
			accountStatus: 1,
			errorMessage: null,
		}

		this._login = this._login.bind(this)
		this._register = this._register.bind(this)
	}

	static navigationOptions = {
		header: null
	}

	_login() {
		firebaseRef.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
		.then((user) => {
      		firebaseRef.database().ref('users').child(user.uid).once('value')
      		.then((snapshot) => {
		        this.props.appStore.post_count = parseInt(snapshot.val().post_count)
		        this.props.appStore.order_count = parseInt(snapshot.val().order_count)
		        this.props.appStore.chat_count = parseInt(snapshot.val().chat_count)
            	this.props.appStore.user_point = parseInt(snapshot.val().user_point)
            	this.props.appStore.uid = parseInt(snapshot.val().user.uid)
		    })
		    this.props.appStore.user = user
		    this.props.appStore.username = user.displayName
      		console.log("user displayName: " + user.displayName + " - " + user.uid)

          //updated user device_id from firebase. This can detect same user with different devices
          OneSignal.getPermissionSubscriptionState((status) => {
            firebaseRef.database().ref('users').child(this.props.appStore.user.uid).update(
              { device_id: this.props.appStore.device_id,})
            this.props.appStore.device_id = status.userId
            });
      		// OneSignal.sendTag("username", user.displayName)
      		// OneSignal.sendTag("uid", user.uid)

      		this.setState({ accountStatus: 0 }) 
    	})
		.catch(function(error) {
			//Handle Errors here.
			console.log(error.code)
			console.log(error.message)
			// ...
			var eChange = error.message
            eChange.toString()
		});
		// this.state.accountStatus === 1 ? this.setState({ errorMessage: 'Authentication failed check email or password'}) : 
		// this.setState({ errorMessage: null})
	}

	_register() {
	}

	render() {

		const { navigate } = this.props.navigation;

		return (
			<KeyboardAvoidingView style={styles.container}>

				{/*<View style={styles.titleWrapper}>
					<Text style={styles.title}>Scolas</Text>
				</View>*/}
				<View style={styles.titleWrapper}>
					<Image
						// style={styles.}
						source={require('../../assets/images/booc1.png')}
						resizeMode="cover"
						// style={{height: 450}} 
						/>
				</View>
				<View>
					<Text style={styles.title}>BooXchange</Text>
				</View>

				{/*<Text style={{color: 'red', fontSize: 13}}>{this.state.errorMessage}</Text>*/}

				<View>
					<TextInput
						placeholder = "EMAIL"
						placeholderTextColor= "rgba(255,255,255,0.7)"
						returnKeyType= "next"
						onSubmitEditing={(event) => { this.refs.SecondInput.focus(); }}
						keyboardType= "email-address"
						autoCapitalize= "none"
						autoCorrect={false}
						underlineColorAndroid= "transparent"
						onChangeText={(text) => this.setState({email: text})}
						value = {this.state.email}
						style={styles.input} />
					<TextInput
						placeholder = "PASSWORD"
						placeholderTextColor= "rgba(255,255,255,0.7)"
						returnKeyType= "go"
						secureTextEntry = {true}
						underlineColorAndroid= "transparent"
						onChangeText={(text) => this.setState({password: text})}
						value = {this.state.password}
						style={styles.input}
						ref='SecondInput'/>

					<View style={styles.buttonrow}>
					<TouchableOpacity style={styles.forgotPass} onPress={() => navigate('PasswordReset')}>
						<Text style={styles.forgotText}>Forgot Password</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.buttonContainer} onPress={this._login}>
						<Text style={styles.buttonText}>LOGIN</Text>
					</TouchableOpacity>
					</View>

				</View>

				<View>
					<TouchableOpacity style={styles.registration} onPress={() => navigate('Register')}>
						<Text style={styles.registerButtonText}>create account</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		// backgroundColor: '#25a1e0'
		backgroundColor: 'rgb(51,204,102)'
	},

	title: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		alignSelf: 'center'
	},

	titleWrapper: {
		justifyContent: 'center',
		alignItems: 'center',
		flex:1,
		height: 150,
		// width: -5
	},

	input: {
		height: 40,
		backgroundColor: 'rgba(1, 87, 155, 0.2)',
		marginBottom: 10,
		color: '#FFF',
		paddingHorizontal: 10
	},

	buttonContainer: {
		backgroundColor: '#34495e',
		paddingVertical: 10,
		alignSelf: 'flex-end',
		width: 150
	},

	buttonText: {
		textAlign: 'center',
		color: '#FFFFFF',
		fontWeight: '700'
	},

	buttonrow: {
		flexDirection: 'row',
		justifyContent: 'center'
	},

	forgotPass: {
		alignSelf: 'flex-start',
		paddingTop: 10,
		paddingHorizontal: 20
	},

	forgotText: {
		color: '#FFFFFF'
	},

	registration: {
		paddingTop: 10,
		paddingBottom: 40,
	},

	registerButtonText: {
		textAlign: 'center',
		color: '#FFFFFF',
		fontWeight: '400'
	}

});
