import React, {Component} from 'react';
import { View, Image, Keyboard, TextInput, Text } from 'react-native';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkTheme
} from 'react-native-ui-kitten';
import { Button } from 'react-native-elements'
import { firebaseRef } from '../../services/Firebase'

export default class PasswordRecovery extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props)
    this.state = {
      email: "",
    }

    this._passRecover = this._passRecover.bind(this)
  }

  _passRecover(){
    firebaseRef.auth().sendPasswordResetEmail(this.state.email).then((user) => {
      alert("Password reset email has been sent")
    }).catch(function(error) {
      alert("error son!")
      console.log(error)
    });
  }

  render() {
    let renderIcon = () => {
      // if (RkTheme.current.name === 'light')
      //   return <Image style={styles.image} source={require('../../assets/images/logo.png')}/>;
      // return <Image style={styles.image} source={require('../../assets/images/logoDark.png')}/>
    };

    return (
      <View behavior='position'
            style={styles.screen}
            onStartShouldSetResponder={ (e) => true}
            onResponderRelease={ (e) => Keyboard.dismiss()}>
        <View style={styles.header}>
          {renderIcon()}
          <RkText style={{fontSize: 35, color: 'white', textAlign: 'center'}}>Password Recovery</RkText>
        </View>
        <View style={styles.content}>
          <TextInput
            placeholder = "Email"
            placeholderTextColor= "rgba(255,255,255,0.7)"
            returnKeyType= "go"
            keyboardType= "email-address"
            autoCapitalize= "none"
            autoCorrect={false}
            underlineColorAndroid= "transparent"
            onChangeText={(text) => this.setState({email: text})}
            value = {this.state.email}
            style={styles.input} />

          <Text style={styles.instructions}>
            Enter your email above to receive your password reset instructions
          </Text>

          <Button
            large
            color= 'white'
            title= 'SEND'
            onPress={this._passRecover}
            backgroundColor='rgb(101,73,114)'
            buttonStyle={{ width: 320, margin: 10}}/>
        </View>
          
        {/*<GradientButton style={styles.save} rkType='large' text='SEND' onPress={() => {
          this.props.navigation.goBack()
        }}/>*/}
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingVertical: scaleVertical(24),
    justifyContent: 'space-between',
    backgroundColor: 'rgb(51,204,102)',
    alignItems: 'center'
  },
  header: {
    paddingTop: 70,
    marginBottom: 10,
    alignItems: 'center'
  },
  image: {
    // marginVertical: scaleVertical(27),
    // height: scaleVertical(77),
    resizeMode: 'contain'
  },
  content: {
    alignItems: 'center'
  },
  input: {
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    width: 320,
    // height: 80,
    fontSize: 18,
    margin: 10,
    color: '#FFF',
    paddingHorizontal: 10
  },
  instructions: {
    paddingBottom: 100,
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center'
  },
}));