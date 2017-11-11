import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Router, Scene } from 'react-native-router-flux';
import { Provider } from 'mobx-react/native';
import appStore from './src/store/AppStore';
import { StackNavigator } from 'react-navigation';

//import Splash from '../Splash';
// import Login from './components/Authentication/Login';
// import Register from './components/Authentication/Register';
//import SearchPage from './components/SearchPage';
// import Home from './navigations/Home';
// import StoreView from './components/Listings/StoreView'
//import Profile from './components/Profile/Profile'

import { SignedOut, SignedIn } from "./src/navigations/router";
import { firebaseRef } from './src/services/Firebase'
import LoginState from "./src/navigations/router";
// import LoginState from './src/components/Authentication/LoginState'
import OneSignal from 'react-native-onesignal';
import BackgroundTask from 'react-native-background-task'
import Chat from './src/components/Chat/Chat';

// BackgroundTask executer. you can put any function to start process in background.
// The executer must be on the top level js(outside class)
BackgroundTask.define(() => {
  console.log('Hello from a back`ground task')
  //this will re-run notification in background every 7-15 minutes
  Chat.runSendNotification(appStore.user.uid);
})

// added @inject on class because found issue after user login, this.props.appStore
// was not kept in appStore which cause error of undefined props.
// @inject("appStore") @observer
export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // signedIn: false,
            // checkSignIn: false,
            device_id: '',
        }
    }

    componentWillMount() {
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
    }


        componentWillUnmount() {
          //execute notification function even device unmount
            OneSignal.removeEventListener('received', this.onReceived);
            OneSignal.removeEventListener('opened', this.onOpened.bind(this));
            OneSignal.removeEventListener('registered', this.onRegistered);
            OneSignal.removeEventListener('ids', this.onIds);
        }

        onReceived(notification) {
            console.log("Notification received: ", notification);
        }

        onOpened(openResult) {
          console.log('Message: ', openResult.notification.payload.body);
          console.log('Data: ', openResult.notification.payload.additionalData);
          console.log('isActive: ', openResult.notification.isAppInFocus);
          console.log('openResult: ', openResult);

          //If yes button clicked, execute something.
          if(openResult.action.actionID == 'id1'){

          //get current user's user_point from firebase and updated it
            firebaseRef.database().ref('users/' + this.props.appStore.user.uid).once('value')
              .then(snapshot => {
                var get_total = snapshot.val().user_point - 1
                firebaseRef.database().ref('users')
                .child(this.props.appStore.user.uid).update( { user_point : get_total } )
                });

          //get current user's user_point from firebase and updated it
            firebaseRef.database().ref('users/' + this.props.appStore.seller_uid).once('value')
              .then(snapshot => {
                var get_total = snapshot.val().user_point + 1
                firebaseRef.database().ref('users')
                .child(this.props.appStore.seller_uid).update( { user_point : get_total } )
                });

          // cancel BackgroundTask after user clicked yes button
            BackgroundTask.cancel()

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


    render() {
      return(
        <Provider appStore={appStore}>
          <LoginState />
        </Provider> 
      );
    }

  componentDidMount() {
  //this OneSignal.configure({}) will register user data in onesignal api
  OneSignal.configure({});
    }
}


// export default class App extends Component {
//   render() {
//     return (
//        <Provider appStore={appStore}>
//      <Router>
//        <Scene key="root">

//                 <Scene
//                     key="honv"
//                     component={ Home }
//                     //hideNavBar={true}
//                     initial />

//          <Scene
//            key="login"
//            component={Login}
//            hideNavBar={true} />

//          <Scene
//            key="register"
//            component={Register}
//            title="Register" />

//      {/*   <Scene
//            key="searchpage"
//            component={SearchPage}
//            title="Search" />

//                 <Scene
//                     key="storeview"
//                     component={StoreView}
//                     title="Store" />*/}

//        </Scene>
//      </Router>
//         </Provider>
//     );
//   }
// }
