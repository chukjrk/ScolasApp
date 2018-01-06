import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, Platform } from 'react-native';
import { RkText, RkStyleSheet, RkTheme, RkButton } from 'react-native-ui-kitten';
import { StackNavigator, NavigationActions } from 'react-navigation';
import { observer,inject } from 'mobx-react/native';
import { firebaseRef } from '../../services/Firebase'

@inject("appStore") @observer
export default class Settings extends Component {
  static navigationOptions = {
    title: 'Settings'.toUpperCase()
  };

  constructor(props) {
    super(props);

    this.state = {
      newEmail: "",
      newPassword: "",
    }

    this.changeEmail = this._changeEmail.bind(this)
    this.changePassword = this._changePassword.bind(this)
    this._logOut = this._logOut.bind(this)
  }

  _changeEmail() {
    firebaseRef.auth().currentUser.updateEmail(this.state.newEmail)
    .then(() => {
    })
    .catch(function(error) {
      console.log(error)
    });
  }

  _changePassword() {
    firebaseRef.auth().currentUser.updatePassword(this.state.newPassword)
    .then(() => {
    })
    .catch(function(error) {
      console.log(error)
    });
  }

  _logOut() {
    firebaseRef.auth().signOut()
    .then(() => {
      this.props.appStore.username = ""
      this.props.appStore.user = {}
      this.props.appStore.uid = ""
      this.props.appStore.post_count = 0
      this.props.appStore.chat_count = 0
      this.props.appStore.order_count = 0
      this.props.appsStore.user_point = 0
      // toHome = NavigationActions.reset({
      //   index:0
      //   actions: [NavigationActions.navigate({routeName: 'Home'})]
      // });
      // this.props.navigation.dispatch(toHome)  
      // this.props.navigation.navigate('Home')
      console.log('Signed Out');
    }) 
    .catch(function(error) {
      console.log('Sign Out Error', error)
    });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={[styles.row, styles.heading]}>
            <RkText rkType='primary header6'>PROFILE SETTINGS</RkText>
          </View>
          <View style={styles.rowText}>
            <TextInput
              ref = 'EmailInput'
              placeholder = "Update Email"
              placeholderTextColor= "grey"
              returnKeyType= "next"
              onChangeText={(text) => this.setState({newEmail: text})}
              keyboardType= "email-address"
              autoCapitalize= "none"
              underlineColorAndroid= "transparent"
              autoCorrect={false}
              style={styles.input} />
              {/*onSubmitEditing={(event) => { this.refs.EmailInput.setNativeProps({text: ''}); }} />*/}

              <TouchableOpacity style={{alignSelf: 'flex-end'}}>
                <RkButton
                  style={{marginBottom: 5, borderRadius: 100}}
                  rkType='outline'
                  contentStyle={{}}
                  onPress={this.changeEmail}>Save</RkButton>
              </TouchableOpacity>
          </View>
          <View style={styles.rowText}>
            <TextInput
              ref = 'ThirdInput'
              placeholder = "Change Password"
              placeholderTextColor= "grey"
              returnKeyType= "next"
              onChangeText={(text) => this.setState({newPassword: text})}
              secureTextEntry = {true}
              underlineColorAndroid= "transparent"
              style={styles.input} />

              <TouchableOpacity style={{alignSelf: 'flex-end'}} >
                <RkButton
                  style={{marginBottom: 5, borderRadius: 100, alignSelf: 'flex-end'}}
                  rkType='outline'
                  onPress={this.changePassword}>Save</RkButton>
              </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.row, styles.heading]}>
            <RkText rkType='primary header6'>SUPPORT</RkText>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton}>
              <RkText rkType='header6'>Help</RkText>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton}>
              <RkText rkType='header6'>Privacy Policy</RkText>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton}>
              <RkText rkType='header6'>Terms & Conditions</RkText>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton} onPress={this._logOut} >
              <Text rkType='header6' style={{color: 'red'}}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.screen.base,
  },
  header: {
    paddingVertical: 25
  },
  section: {
    marginVertical: 25
  },
  heading: {
    paddingBottom: 12.5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  rowText: {
    justifyContent: 'space-between',
    paddingHorizontal: 17.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
    alignItems: 'center'
  },
  rowButton: {
    flex: 1,
    paddingVertical: 24
  },
  switch: {
    marginVertical: 14
  },
  input: {
    width: 340,
    // backgroundColor: 'rgba(1, 87, 155, 0.2)',
    margin: 10,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: Platform.OS === 'ios' ? 50 : null
  },
}));