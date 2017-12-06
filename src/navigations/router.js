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
import { observer,inject } from 'mobx-react/native';
import { Icon } from 'react-native-elements'

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
			title: "Book"
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
			title: "Register"
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
		showIcon: true,
		style: {
			backgroundColor: '#01579B'
		},
	},
});

@inject("appStore") @observer
export default class LoginState extends Component {

	constructor(props) {
		super(props);

		this.state = {
			signedIn: false,
			checkSignIn: false,
        // device_id: '',
    	}
	}

	componentWillMount(){
		firebaseRef.auth().onAuthStateChanged((user) => {
			if (user) {
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
}
