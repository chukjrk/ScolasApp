import React, { Component } from 'react';
import { StackNavigator, TabNavigator, TabView, NavigationActions, TabBarBottom } from 'react-navigation';
import { firebaseRef } from '../services/Firebase'
import Login from '../components/Authentication/Login';
import PasswordRecovery from '../components/Authentication/PasswordRecovery';
import Register from '../components/Authentication/Register';
import Profile from "../components/Profile/Profile";
import Settings from "../components/Profile/Settings";
import CreateNew from "../components/Listings/CreateNew"
import Purchased from "../components/Listings/Purchased"
import Archive from "../components/Listings/Archive"
import StoreView from "../components/Listings/StoreView"
import Chat from '../components/Chat/Chat'
import ChatHome from "../components/Chat/ChatHome"
import Book from '../components/Listings/Book'
import appStore from '../store/AppStore'
import { observer,inject } from 'mobx-react/native';
import { Icon } from 'react-native-elements'
// import BackgroundTask from 'react-native-background-task'
import OneSignal from 'react-native-onesignal';
import VerifyMessage from '../components/Authentication/VerifyMessage'
import Intro from '../components/Authentication/Intro'
// import BackgroundFetch from "react-native-background-fetch";

// added navigation to Chat using StackNavigator. Somehow using routeName
// is not working
const ChildPage = StackNavigator({
	Store: {
		screen: StoreView,
		navigationOptions: {
			header: null
		}
	},
	Book: {
		screen: Book,
		navigationOptions: {
			// title: "Book"
		}
	},
	Chat: {
		screen: Chat,
		navigationOptions: {
			title : "Chat"
		}
	},
})

const ChildPage2 = StackNavigator({
	Home: {
		screen: Profile,
		navigationOptions: {
			header: null
		}
	},
	Settings: {
		screen: Settings,
		navigationOptions: {
		}
	},
	Purchased: {
		screen: Purchased,
		navigationOptions: {
			title: "Books Purchased"
		}
	},
	Archive: {
		screen: Archive,
		navigationOptions: {
			title: "Books Posted"
		}
	},
})

export const SignedOut = StackNavigator ({
	Intro: {
		screen: Intro,
		navigationOptions: {
			header: null
		}
	},
	Login: {
		screen: Login,
		navigationOptions: {
		},
		children: []
	},
	PasswordReset: {
		screen: PasswordRecovery,
		navigationOptions: {
			header: null
		}
	},
	Register: {
		screen: Register,
		navigationOptions: {
		}
	},
	VerifyMessage: {
		screen: VerifyMessage,
		navigationOptions: {
			header: null
		}
	},
}, {
	headerMode: 'screen',
});

export const SignedIn = TabNavigator({
	Home: {
		screen: ChildPage2,
		navigationOptions: {
			tabBarLabel: "Home",
			tabBarIcon: ({ tintColor }) => (
				<Icon
                  name='home'
                  color={tintColor}/>
            ),
		}
	},
	Add: {
		screen: CreateNew,
		navigationOptions: {
			tabBarLabel: "Add Book",
			tabBarIcon: ({ tintColor }) => (
				<Icon
                  name='add'
                  color={tintColor}/>
            ),
		}
	},

	ChatHome: {
		screen: ChatHome,
		navigationOptions: {
			tabBarLabel: "Messages",
			tabBarIcon: ({ tintColor }) => (
				<Icon
                  name='chat-bubble-outline'
                  color={tintColor}/>
            ),
		}
	},

	Store: {
		screen: ChildPage,
		navigationOptions: {
			tabBarLabel: "Store",
			tabBarIcon: ({ tintColor }) => (
				<Icon
                  name='store'
                  color={tintColor}/>
            ),
		}
	},
}, {
	tabBarComponent: TabBarBottom,
	tabBarPosition: 'bottom',
	swipeEnabled: false,
	animationEnabled: false,
	backBehavior: 'none',
	lazy: true,
	tabBarOptions: {
		activeTintColor: 'white',
		inactiveTintColor: 'rgba(255,255,255,0.55)',
		showIcon: true,
		style: {
			// backgroundColor: '#01579B'
			backgroundColor: '#27924a'
		},
	},
});


// BackgroundTask executer. you can put any function to start process in background.
// The executer must be on the top level js(outside class)
// BackgroundTask.define(() => {
//   console.log('Hello from a back`ground task')
//   //this will re-run notification in background every 7-15 minutes
//   // data.status === 'sold' ? firebaseRef.database().ref('posts').child(data.puid).remove() : null
//   Book.runSendNotification(appStore.user.uid);
// })
// added @inject on class because found issue after user login, this.props.appStore
// was not kept in appStore which cause error of undefined props.

// BackgroundFetch.configure({
	// Book.runSendNotification(appStore.user.uid);
// })

@inject("appStore") @observer
export default class LoginState extends Component {

	constructor(props) {
		super(props);

		this.state = {
			signedIn: false,
			checkSignIn: false,
        	device_id: '',
    	}
	}

	componentWillMount(){
		//every OneSignal.addEventListener is required to get data from notification and etcetra
      	// this.onReceived - can execute anything after got notification
        OneSignal.addEventListener('received', this.onReceived);
      	// this.onOpened - can execute anything after user click notification or action button
        OneSignal.addEventListener('opened', this.onOpened.bind(this));
      	// this.registered - show info that the device has been registered
        OneSignal.addEventListener('registered', this.onRegistered);
      	// this.onIds - show info of access_token and device_id
        OneSignal.addEventListener('ids', this.onIds);

      	// since the function above was reserved, must put .bind(this) if want to execute outside function
      	// or global variable.
		firebaseRef.auth().onAuthStateChanged((user) => {
			// user.sendEmailVerification().then(() => {  
			// remember to add email verification after debugging  
			if (user && user.emailVerified) {
				console.log("--------- LOGGED AS " + user.displayName + " ---------")
				this.props.appStore.user = user
				this.props.appStore.username = user.displayName
				this.props.appStore.uid = user.uid
				firebaseRef.database().ref('users').child(user.uid).once('value')
				.then((snapshot) => {
					this.props.appStore.post_count = parseInt(snapshot.val().post_count)
					this.props.appStore.order_count = parseInt(snapshot.val().order_count)
					this.props.appStore.chat_count = parseInt(snapshot.val().chat_count)
            		// added user_point to appStore.user_point after user login
            		this.props.appStore.user_point = parseInt(snapshot.val().user_point)
            		this.props.appStore.uid = parseInt(snapshot.val().user.uid)
        		})
				this.setState({ signedIn: true, checkSignIn: true })
			} else {
				this.setState({ signedIn: false, checkSignIn: true })
			}
		})
	}

	onOpened(openResult) {
		console.log('Message: ', openResult.notification.payload.body);
		console.log('Data: ', openResult.notification.payload.additionalData);
		console.log('isActive: ', openResult.notification.isAppInFocus);
		console.log('openResult: ', openResult);

		//If yes button clicked, execute something.
		if(openResult.action.actionID == 'id1'){
			//get current user's user_point from firebase and updated it
			firebaseRef.database().ref('users/' + this.props.appStore.seller_uid).once('value')
			.then(snapshot => {
			    var get_total = snapshot.val().user_point + 1
			    firebaseRef.database().ref('users')
			    .child(this.props.appStore.seller_uid).update( { user_point : get_total } )
		    });
		    Book.deletePost(this.props.appStore.current_puid);
		    // firebaseRef.database().ref('posts').child(data.puid).remove()

			// cancel BackgroundTask after user clicked yes button
			BackgroundTask.cancel()
			BackgroundFetch.finish()
		}else{
			console.log('send it again');
		}
	}

    onRegistered(notifData) {
        console.log("Device had been registered for push notifications!", notifData);
    }

    onIds(device) {
        console.log('Device info: ', device.userId);
    }

    onReceived(notification) {
        console.log("Notification received: ", notification);
    }

    componentWillUnmount() {
      	//execute notification function even device unmount
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened.bind(this));
        OneSignal.removeEventListener('registered', this.onRegistered);
        OneSignal.removeEventListener('ids', this.onIds);
    }

	render() {
        const { checkSignIn, signedIn } = this.state;

        if (!checkSignIn) {
            return null
        }
        
        if (signedIn) {
            return (
                    <SignedIn>
                    </SignedIn>
            );
        } else {
            return (
                < SignedOut />
            );
        }
    }

    componentDidMount() {
	  //this OneSignal.configure({}) will register user data in onesignal api
	  OneSignal.configure({});
    }

}
