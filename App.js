import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
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
import Chat from './src/components/Chat/Chat';
import Book from './src/components/Listings/Book'



export default class App extends Component {

    constructor(props) {
      // disabble yellowboc warnings for update to React native
      // console.disableYellowBox = true;
      super(props);

      this.state = {
        // intro: true,
      }
    }


  render() {
    return(
      <Provider appStore={appStore}>
        <LoginState />
      </Provider> 
    );
  }
}