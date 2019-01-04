import React, { Component} from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, Platform, Share } from 'react-native';
import { RkText, RkStyleSheet, RkTheme, RkButton } from 'react-native-ui-kitten';
import { StackNavigator, NavigationActions } from 'react-navigation';
import { observer,inject } from 'mobx-react/native';
import { firebaseRef } from '../../services/Firebase'
// import firebase from 'react-native-firebase'
import branch from 'react-native-branch'

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
      result: "",
    }
    // for sending the invites
    this._showResult = this._showResult.bind(this)
    this._inviting = this._inviting.bind(this)
    // -------------
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
      // this.props.appStore.username = ''
      // this.props.appStore.user = {}
      // this.props.appStore.uid = ''
      // this.props.appStore.post_count = ''
      // this.props.appStore.chat_count = ''
      // this.props.appStore.order_count = ''
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
    branch.logout()
  }

  render() {
    const memberUid = this.props.appStore.user.uid;

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
              <RkText rkType='header6'>HELP</RkText>
            </TouchableOpacity>
          </View>
          {/*<View style={styles.row}>
            <TouchableOpacity style={styles.rowButton}>
              <RkText rkType='header6'>Privacy Policy</RkText>
            </TouchableOpacity>
          </View>*/}
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton}>
              <RkText rkType='header6'>TERMS & CONDITIONS</RkText>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton} onPress={() => this._inviting(memberUid)}>
              <RkText rkType='header6'>SHARE</RkText>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.rowButton} onPress={this._logOut} >
              <Text rkType='header6' style={{color: 'red'}}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Send Invite using react native share
  _showResult(result){
    this.setState({result});
  }

  async _inviting(UUid){
    let branchUniversalObject = await branch.createBranchUniversalObject(UUid, {
      locallyIndex: true,
      title: 'Invitations',
      contentDescription: 'Have you heard of BooXchange? Try it using my link: ',
      contentMetadata: {
        ratingAverage: 4.2,
      }
    })

    let linkProperties = {
      feature: 'referral',
      // channel: 'facebook',
      campaign: 'Local Launch Invites',
      random: UUid,
    }
    // let shareOptions = { messageHeader: 'Join BooXchange', messageBody: 'Have you heard of BooXchange? Try it using my link: ' }
    let controlParams = {
      // $desktop_url: 'http://desktop-url.com/monster/12345'
    }
    console.log("---- This isasdadad ")

    let {url} = await branchUniversalObject.generateShortUrl(linkProperties, controlParams)
    // let {channel, completed, error} = await branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams)
    console.log("---- This ish is URL BABABABABAS ---", url)
    Share.share({
      title: 'BooXchange Invite',
      message: 'Have you heard of BooXchange? Try it using my link: ' + url,
    })
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