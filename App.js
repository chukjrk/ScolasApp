import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Provider } from 'mobx-react/native';
import appStore from './src/store/AppStore';
import { StackNavigator } from 'react-navigation';
import AppIntroSlider from 'react-native-app-intro-slider';

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

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
  },
  title: {
    textAlign: 'center',
    color: 'blue',
    fontSize: 13,
  },
  text: {
    fontSize: 22,
  }
});

const slides = [
  {
    key: 'somethun',
    title: 'Access books from all over your university',
    titleStyle: {color: 'blck'},
    image: require('./src/assets/images/slide1.jpeg'),
    imageStyle: styles.image,
    backgroundColor: '#1b943b',
  },
  {
    key: 'somethun-dos',
    title: 'Get books using points',
    text: 'Message book owners after purchase',
    image: require('./src/assets/images/slide2.jpeg'),
    imageStyle: styles.image,
    backgroundColor: '#FF4900',
  },
  {
    key: 'somethun1',
    title: 'Get points for your books\nAfter purchases have been confirmed',
    // text: 'Get points for your books',
    // text: 'I\'m already out of descriptions\n\nLorem ipsum bla bla bla',
    image: require('./src/assets/images/slide3.png'),
    imageStyle: styles.image,
    backgroundColor: '#879BAF',
  },
  {
    key: 'page4',
    title: 'All books cost 1 point',
    // text: 'I\'m already out of descriptions\n\nLorem ipsum bla bla bla',
    image: require('./src/assets/images/slide4.jpeg'),
    imageStyle: styles.image,
    backgroundColor: '#59b2ab',
  },
  {
    key: 'page5',
    title: 'Get started\nand get your first point',
    // image: require('./src/assets/images/slide3.jpg'),
    // imageStyle: styles.image,
    backgroundColor: '#1b943b',
  }
];

export default class App extends Component {

    constructor(props) {
      super(props);

      this.state = {
        intro: true,
      }
    }

  _onDone = () => {
    // User finished the introduction. Show "real" app
    this.setState({ intro: false })
    // return(
      // <Provider appStore={appStore}>
        // <LoginState />
      // </Provider> 
    // );
  }

  render() {
    const { intro } = this.state;

    if (intro) {
      return (
        <AppIntroSlider
          slides={slides}
          onDone={this._onDone}
          onSkip={this._onDone}
          showSkipButton
        />
      );
    } else {
      return(
        <Provider appStore={appStore}>
          <LoginState />
        </Provider> 
      );
    }
  }
}