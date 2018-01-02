import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

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
    image: require('../../assets/images/slide1.jpeg'),
    imageStyle: styles.image,
    backgroundColor: '#1b943b',
  },
  {
    key: 'somethun-dos',
    title: 'Get books using points',
    text: 'Message book owners after purchase',
    image: require('../../assets/images/slide2.jpeg'),
    imageStyle: styles.image,
    backgroundColor: '#FF4900',
  },
  {
    key: 'somethun1',
    title: 'Get points for your books\nAfter purchases have been confirmed',
    // text: 'Get points for your books',
    // text: 'I\'m already out of descriptions\n\nLorem ipsum bla bla bla',
    image: require('../../assets/images/slide3.png'),
    imageStyle: styles.image,
    backgroundColor: '#879BAF',
  },
  {
    key: 'page4',
    title: 'All books cost 1 point',
    // text: 'I\'m already out of descriptions\n\nLorem ipsum bla bla bla',
    image: require('../../assets/images/slide4.jpeg'),
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

export default class Intro extends Component {

    constructor(props) {
      super(props);
      this.state = {
        intro: true,
      }
    }

  _onDone = () => {
    // User finished the introduction. Show "real" app
    this.props.navigation.navigate('Login')
  }

  render() {
    const { intro } = this.state;
	return (
		<AppIntroSlider
		  slides={slides}
		  onDone={this._onDone}
		  onSkip={this._onDone}
		  showSkipButton
		/>
	);
  }
}