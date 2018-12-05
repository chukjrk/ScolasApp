import React, { Component } from 'react';
import { View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	AsyncStorage,
	KeyboardAvoidingView,
	ImageBackground,
	Dimensions,
	LayoutAnimation,
	UIManager,
 	Image,
  Alert
} from 'react-native';
import { firebaseRef } from '../../services/Firebase'
import Profile from '../Profile/Profile'
import OneSignal from 'react-native-onesignal';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';
import { LoginButton, LoginManager, AccessToken } from 'react-native-fbsdk';
import PropTypes from 'prop-types';
import { Button, SocialIcon } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import branch from 'react-native-branch';
import { observer, inject } from 'mobx-react/native';

const firebase = require('firebase');

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
//--------------------------------------------------------------------------------------------------------

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// const BG_IMAGE = require('../../assets/images/booc1.png');

// Enable LayoutAnimation on Android
UIManager.setLayoutAnimationEnabledExperimental
  && UIManager.setLayoutAnimationEnabledExperimental(true);

const TabSelector = ({ selected }) => {
  return (
    <View style={styles.selectorContainer}>
      <View style={selected && styles.selected}/>
    </View>
  );
};

TabSelector.propTypes = {
  selected: PropTypes.bool.isRequired,
};

@inject("appStore") @observer
export default class Login extends Component {
	constructor(props) {
    super(props);
	    this.state = {
	      email: '',
	      password: '',
	      selectedCategory: 0,
	      isLoading: false,
	      isEmailValid: true,
	      isPasswordValid: true,
	      isConfirmationValid: true,
	      status: '',
	      accountStatus: 1,
	      errorMessage: null,
	      wordStatus: null,
				emailStatus: 1,
     		referred_by: '',
        profile_name: ''
	    };

		this.selectCategory = this.selectCategory.bind(this);
		this._login = this._login.bind(this);
		this._register = this._register.bind(this)
	}

  	// async componentDidMount() {
	  //   this.setState({ fontLoaded: true });
  	// }
	selectCategory(selectedCategory) {
  	LayoutAnimation.easeInEaseOut();
  	this.setState({
  		selectedCategory,
  		isLoading: false,
 		});
	}

	validateEmail(email) {
  	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  	return re.test(email);
	}

	//------------------------------------------------------------------------------------------------------------------------------
	// referral reward function called when user registers if referred through branch link
	//-----------------------------------------------------------------------------------------------------------------------------
	rewardReferrals(){
		// let installParams = await branch.getFirstReferringParams()
		// console.log('Values form installparams printed whole', installParams)
		firebaseRef.database().ref('users').child(referrerUid).once('value')
		.then(snapshot => {
			var get_total = snapshot.val().user_point + 0.334
			firebaseRef.database().ref('users').child(referrerUid)
			.update( { user_point : get_total } )
		});		
	}
	//---------------------------------------------------------------------------------------------------------------------------------

  static navigationOptions = {
    header: null
  }

	_login() {
		this.setState({ isLoading: true });
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
    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        isLoading: false,
        // isPasswordValid: password.length >= 8,
      });
    }, 1500);
		// this.state.accountStatus === 1 ? this.setState({ errorMessage: 'Authentication failed check email or password'}) : 
		// this.setState({ errorMessage: null})
	}

	_loginFacebook = () => {
    console.log('---------The Next Stp ------------- 1')
    LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        console.log('---------The Next Stp ------------- 2')
        if (result.isCancelled) {
          Alert.alert('Sign was cancelled.');
        } else {
          console.log('---------The Next Stp -------------')
          AccessToken.getCurrentAccessToken()
          .then((data) => {
            const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
            console.log('Y2 means a lot purutututu: ', credential)
            firebaseRef.auth().signInAndRetrieveDataWithCredential(credential)
            .then((user) => {
              // var user = firebase.auth().currentUser;
              console.log('Y2 means a lot', firebaseRef.auth().currentUser.uid)
              const isFirstTimeSignIn = firebaseRef.auth().currentUser.metadata.creationTime
              console.log('Bitches love sosa: ', isFirstTimeSignIn)
              console.log('Bitches love sosa 2: ', firebaseRef.auth().currentUser.metadata.lastSignInTime )
              if (isFirstTimeSignIn == firebaseRef.auth().currentUser.metadata.lastSignInTime) {
                const facebookNonName = firebaseRef.auth().currentUser.displayName
                const facebookName = JSON.stringify(facebookName);
                console.log('Sosa was here------>>>>', firebaseRef.auth().currentUser.displayName)
                // firebaseRef.database().ref('usernameList').child(facebookName).set(firebaseRef.auth().currentUser.uid)
                firebaseRef.auth().currentUser.updateProfile({displayName: facebookName})
                .then(() => {
                  console.log('---------Here i am ===============')
                  // this.setState({emailStatus: 0})
                  //Get device_id using OneSignal.getPermissionSubscriptionState() and register it to firebase
                  OneSignal.getPermissionSubscriptionState((status) => {
                    const uid = firebase.auth().currentUser.uid
                    const username = firebase.auth().currentUser.displayName
                    const post_count = 0
                    const chat_count = 0
                    const order_count = 0
                    const user_point = 1 //added and set user_point default to 1
                    const device_id = status.userId // added
                    console.log("One_Signal device_id: ", device_id)
                    // const refferred_by = this.state.referrerUid

                    firebaseRef.database().ref('users/' + firebase.auth().currentUser.uid)
                    .set({
                      uid,
                      username,
                      post_count,
                      chat_count,
                      order_count,
                      user_point,
                      device_id,
                      // referred_by
                    })

                    this.props.appStore.uid = firebase.auth().currentUser.uid
                    this.props.appStore.username = firebase.auth().currentUser.displayName
                    this.props.appStore.post_count = post_count
                    this.props.appStore.order_count = order_count
                    this.props.appStore.chat_count = chat_count
                    this.props.appStore.user = user
                    this.props.appStore.user_point = user_point
                    this.props.appStore.device_id = device_id
                    OneSignal.sendTag("uid", firebase.auth().currentUser.uid)

                    console.log("------------get the data from input fields or set the default-----------------")
                    console.log("username: " + user.displayName)
                    console.log("post_count: " + post_count)
                    console.log("order_count: " + order_count)
                    console.log("chat_count: " + chat_count)
                    console.log("user: " + user)
                    console.log("user displayname: " + user.displayName)
                    console.log("user5: " + user.uid)
                    console.log("user_point: " + user_point)

                    console.log("--------------------After save in appstore, then load back data in appstore-----------------")
                    console.log("username:" + this.props.appStore.username)
                    console.log("post_count:" + this.props.appStore.post_count)
                    console.log("order_count:" + this.props.appStore.order_count)
                    console.log("chat_count:" + this.props.appStore.chat_count)
                    console.log("user:" + this.props.appStore.user)
                    console.log("user1:" + this.props.appStore.user.displayName)
                    console.log("user5:" + this.props.appStore.user.uid)
                    console.log("user_point:" + this.props.appStore.user_point)                   
                  });
                console.log("------Branch Haead-----")
                if (referrerUid){
                  this.rewardReferrals()
                }
                });
              } else {
                firebaseRef.database().ref('users').child(firebase.auth().currentUser.uid).once('value')
                .then((snapshot) => {
                  this.props.appStore.post_count = parseInt(snapshot.val().post_count)
                  this.props.appStore.order_count = parseInt(snapshot.val().order_count)
                  this.props.appStore.chat_count = parseInt(snapshot.val().chat_count)
                  this.props.appStore.user_point = parseInt(snapshot.val().user_point)
                  this.props.appStore.uid = parseInt(snapshot.val().user.uid)
                })
                this.props.appStore.user = firebase.auth().currentUser
                this.props.appStore.username = firebase.auth().currentUser.displayName
                console.log("user displayName: " + firebase.auth().currentUser.displayName + " - " + firebase.auth().currentUser.uid)

                //updated user device_id from firebase. This can detect same user with different devices
                OneSignal.getPermissionSubscriptionState((status) => {
                  firebaseRef.database().ref('users').child(this.props.appStore.user.uid).update(
                    { device_id: this.props.appStore.device_id,})
                    this.props.appStore.device_id = status.userId
                });
              }
              // OneSignal.sendTag("username", user.displayName)
              // OneSignal.sendTag("uid", user.uid)
              this.setState({ accountStatus: 0 }) 
            })
            .catch((error) => {
              console.log('------------error days--------', error.message)
            });
          });
        }
      },
      (error) => {
        Alert.alert('Sign in error', error);
      },
    );
	};

	_register() {
		// if (this.state.email.includes('.edu')) {
		// 	this.setState({ errorMessage: null })
			// if (this.state.password == this.state.verifyPassword) {
			// 	this.setState({ wordStatus: null})
				firebaseRef.database().ref('usernameList').child(this.state.profile_name.toLowerCase()).once('value')
				.then((snapshot) => {
					if (snapshot.val()){
					} else {
						firebaseRef.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
						.then((user) => {
							user.sendEmailVerification().then(() => {
							firebaseRef.database().ref('usernameList').child(this.state.profile_name.toLowerCase()).set(user.uid)
  							user.updateProfile({displayName: this.state.profile_name})
  							.then(() => {
                  console.log('---------Here i am ===============')
  								// this.setState({emailStatus: 0})
  								//Get device_id using OneSignal.getPermissionSubscriptionState() and register it to firebase
  								OneSignal.getPermissionSubscriptionState((status) => {
  									const uid = user.uid
	  								const username = user.displayName
	  								const post_count = 0
	  								const chat_count = 0
	  								const order_count = 0
	  								const email = user.email
	  								const user_point = 1 //added and set user_point default to 1
	  								const device_id = status.userId // added
	  								console.log("One_Signal device_id: ", device_id)
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
		  							this.props.appStore.device_id = device_id
		  							OneSignal.sendTag("uid", user.uid)

		  							console.log("------------get the data from input fields or set the default-----------------")
		  							console.log("username: " + user.displayName)
		  							console.log("post_count: " + post_count)
		  							console.log("order_count: " + order_count)
		  							console.log("chat_count: " + chat_count)
		  							console.log("user: " + user)
		  							console.log("user displayname: " + user.displayName)
		  							console.log("user2: " + user.email)
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
              Alert.alert(
                'Verification',
                'Verification email has been sent. Please verify your email then login!',
                [
                  {text: 'OK', onPress: () => console.log('OK Pressed')},
                ],
                { cancelable: false }
              )
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
		// 	} else {
		// 		console.log("Passwords do not match");
  //     	this.setState({ wordStatus: 'Passwords do not match'})
		// 	}
		// } else {
		// 	this.setState({errorMessage: 'Email must be a school email (e.g .edu)'})
		// }
    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        isLoading: false,
        // isPasswordValid: password.length >= 8,
      });
    }, 1500);
	}

	render() {
		const {
			selectedCategory,
			isLoading,
			isEmailValid,
			isPasswordValid,
			isConfirmationValid,
		} = this.state;
		const isLoginPage = selectedCategory === 0;
		const isSignUpPage = selectedCategory === 1;
		const { navigate } = this.props.navigation;

		return (
			// <KeyboardAvoidingView
			//  style={styles.container}
			//  keyboardVerticalOffset={-64} >
			// <View style={{flex: 1}}>
	    <KeyboardAwareView animated={true} style={styles.container}>
	    	<Text style={{color: 'red', fontSize: 13}}>{this.state.wordStatus}</Text>
    		<Text style={{color: 'red', fontSize: 13}}>{this.state.errorMessage}</Text>
				<View style={styles.titleWrapper}>
					<Image
						// style={styles.}
						source={require('../../assets/images/booc1.png')}
						resizeMode="cover"
						/>
				</View>
				<View>
					<Text style={styles.title}>BooXchange</Text>
				</View>

				<View style={{flexDirection: 'row'}}>
	        <TouchableOpacity
          disabled={isLoading}
          clear
          onPress={() => this.selectCategory(0)}
          style={[styles.categoryText, isLoginPage && styles.selectedCategoryText]}>
	         {/* containerStyle={{flex: 1}}
	          titleStyle=
	          title={'Login'}>*/}
	          <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 3, marginBottom: 4, color: 'white'}}> Login </Text>
	        </TouchableOpacity>
	        <TouchableOpacity
	          disabled={isLoading}
	          clear
	          // activeOpacity={0.7}
	          onPress={() => this.selectCategory(1)}
	          style={[styles.categoryText, isSignUpPage && styles.selectedCategoryText]}>
	          <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 3, marginBottom: 4, color: 'white'}}> Sign Up </Text>
	        </TouchableOpacity>
	      </View>
	      <View style={styles.rowSelector}>
	        <TabSelector selected={isLoginPage}/>
	        <TabSelector selected={isSignUpPage}/>
	      </View>
				{/*<Text style={{color: 'red', fontSize: 13}}>{this.state.errorMessage}</Text>*/}
				{isLoginPage &&
        <View>
					<TextInput
						placeholder = "EMAIL"
						// placeholderTextColor= "rgba(255,255,255,1)"
            placeholderTextColor= 'black'
						returnKeyType= "next"
						onSubmitEditing={(event) => { this.refs.PasswordInput.focus(); }}
						keyboardType= "email-address"
						autoCapitalize= "none"
						autoCorrect={false}
						underlineColorAndroid= "transparent"
						onChangeText={(text) => this.setState({email: text})}
						value = {this.state.email}
						style={styles.input} 
						errorMessage={isEmailValid ? null : 'Please enter a valid email address'}/>
					<TextInput
						placeholder = "PASSWORD"
						// placeholderTextColor= "rgba(255,255,255,0.7)"
            placeholderTextColor= 'black'
						// returnKeyType= "go"
						returnKeyType={isSignUpPage ? 'next' : 'done'}
						secureTextEntry = {true}
						blurOnSubmit={true}
						underlineColorAndroid= "transparent"
						onChangeText={(text) => this.setState({password: text})}
						value = {this.state.password}
						style={styles.input}
						ref='PasswordInput'
						errorMessage={isPasswordValid ? null : 'Please enter at least 8 characters'}/>

					<View>
						{/*<TouchableOpacity style={styles.forgotPass} onPress={() => navigate('PasswordReset')}>
							<Text style={styles.forgotText}>Forgot Password</Text>
						</TouchableOpacity>*/}
						<Button
	            buttonStyle={styles.switchButton}
	            containerStyle={{marginTop: 32}}
              containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
	            activeOpacity={0.8}
	            title={isLoginPage ? 'LOGIN' : 'SIGN UP'}
	            onPress={isLoginPage ? this._login : this._register}
	            titleStyle={styles.loginTextButton}
	            loading={isLoading}
	            disabled={isLoading}
	            raised={true}
	            rounded
	          />
					  <SocialIcon
						  title='Sign In With Facebook'
						  button
						  type='facebook'
						  onPress={this._loginFacebook}
						/>
					</View>
				</View>}

        {isSignUpPage &&
        <View>
          <TextInput
            placeholder = "NAME"
            placeholderTextColor= "black"
            returnKeyType= "next"
            onChangeText={(text) => this.setState({profile_name: text})}
            autoCorrect={false}
            underlineColorsAndroid= "transparent"
            style={styles.input}
            onSubmitEditing={(event) => { this.refs.EmailInput.focus(); }} />
          <TextInput
            placeholder = "EMAIL"
            // placeholderTextColor= "rgba(255,255,255,1)"
            placeholderTextColor= 'black'
            returnKeyType= "next"
            onSubmitEditing={(event) => { this.refs.PasswordInput.focus(); }}
            keyboardType= "email-address"
            autoCapitalize= "none"
            autoCorrect={false}
            underlineColorAndroid= "transparent"
            onChangeText={(text) => this.setState({email: text})}
            value = {this.state.email}
            style={styles.input}
            ref='EmailInput' 
            errorMessage={isEmailValid ? null : 'Please enter a valid email address'}/>
          <TextInput
            placeholder = "PASSWORD"
            // placeholderTextColor= "rgba(255,255,255,0.7)"
            placeholderTextColor= 'black'
            // returnKeyType= "go"
            returnKeyType={isSignUpPage ? 'next' : 'done'}
            secureTextEntry = {true}
            blurOnSubmit={true}
            underlineColorAndroid= "transparent"
            onChangeText={(text) => this.setState({password: text})}
            value = {this.state.password}
            style={styles.input}
            ref='PasswordInput'
            errorMessage={isPasswordValid ? null : 'Please enter at least 8 characters'}/>

          <View>
            {/*<TouchableOpacity style={styles.forgotPass} onPress={() => navigate('PasswordReset')}>
              <Text style={styles.forgotText}>Forgot Password</Text>
            </TouchableOpacity>*/}
            <Button
              buttonStyle={styles.switchButton}
              containerStyle={{marginTop: 32}}
              containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
              activeOpacity={0.8}
              title={isLoginPage ? 'LOGIN' : 'SIGN UP'}
              onPress={isLoginPage ? this._login : this._register}
              titleStyle={styles.loginTextButton}
              loading={isLoading}
              disabled={isLoading}
              raised={true}
              rounded
            />  
          </View>
        </View>}

				<View>
					<TouchableOpacity style={styles.registration} onPress={() => navigate('PasswordReset')}>
						<Text style={styles.registerButtonText}>Forgot Password?</Text>
					</TouchableOpacity>
				</View>
	  	</KeyboardAwareView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		// backgroundColor: '#25a1e0'
		backgroundColor: 'rgb(51,204,102)'
    // backgroundColor: 'rgb(11,120,47)'
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
		// backgroundColor: 'rgba(1, 87, 155, 0.2)',
    backgroundColor: 'rgba(255,255,255,0.8)',
		marginBottom: 10,
		// color: '#FFF',
    color: 'black',
		paddingHorizontal: 10,
		fontSize: 15,
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
	},

  rowSelector: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: 'transparent',
    width: SCREEN_WIDTH - 45,
    borderRadius: 10,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems:'center',
    borderWidth: 3,
    borderColor: 'white',
    alignSelf: 'center',
    // opacity: 0.2,
  },
  selectorContainer: {
    flex: 1,
    alignItems: 'center',
  },
  selected: {
    position: 'absolute',
    borderRadius: 50,
    height: 0,
    width: 0,
    top: -5,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderColor: '#cc3399',
    backgroundColor: '#cc3399',
    opacity: 1,
  },
  loginTextButton: {
    fontSize: 20,
    // color: 'white',
    fontWeight: 'bold',
  },
  switchButton: {
    // backgroundColor: 'rgba(51, 153, 204, 1)',
    backgroundColor: 'rgba(204,51,153,1)',
    backfaceVisibility: 'hidden',
    fontWeight: 'bold',
    // borderRadius: 0,
    height: 50,
    // width: SCREEN_WIDTH - 45,
  },
  categoryText: {
    alignItems: 'center',
    // color: 'white',
    // fontSize: 40,
    // fontFamily: 'sans-serif',
    // height: 50,
    backgroundColor: 'rgba(204,51,153,0.4)',
    opacity: 1,
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 25
  },
  selectedCategoryText: {
    opacity: 1,
    color: 'white',
    flex: 1,
    backgroundColor: 'rgba(204,51,153,1)',
    marginHorizontal: 15,
    borderRadius: 25
  },
});
