import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten';
import { Avatar, Icon } from 'react-native-elements'
//import Registration from '../Authentication/RegistrationForm';

export default class Profile extends React.Component {

  // constructor(props) {
  //   super(props);
  //   this.user = Name();
  // }

  _logOut() {
    firebaseRef.auth().signOut()
    .then(() => {
      this.props.appStore.username = ""
      this.props.appStore.user = {}
      this.props.appStore.post_count = 0
      this.props.appStore.chat_count = 0
      this.props.appStore.order_count = 0
      console.log('Signed Out');
    }, function(error) {
      console.log('Sign Out Error', error)
    });
  }

  render() {
    const name = `${this.username}`;

    return (
      <ScrollView style={styles.root}>

        <View style={[styles.header, styles.bordered]}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.buttons}>
              {/*<RkButton style={styles.button} rkType='icon circle' onPress={this._logout}>*/}
                <Icon 
                  name='settings'
                  onPress={this._logout} />
                {/*<RkText rkType='moon large primary' style={styles.buttonText}>Sign Out</RkText>*/}
              {/*</RkButton>*/}
            </TouchableOpacity>
            <Avatar
              rounded
              xlarge 
              source={require('../../assets/images/faceO.png')} />
            {/*<Imagez source={require('../../assets/images/faceO.png')} style={styles.loImage}/>*/}
            <View style={styles.buttons}>
              {/*<RkButton style={styles.button} rkType='icon circle'>*/}
                <Icon 
                  name='settings'
                  type='material-icons' />
                {/*<RkText rkType='moon large primary'>Thing 2</RkText>*/}
              {/*</RkButton>*/}
            </View>
          </View>
          <View style={styles.section}>
            <RkText rkType='header2'>{name}</RkText>
          </View>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.section}>
            <RkText rkType='header3' style={styles.space}>12</RkText>
            <RkText rkType='secondary1 hintColor'>Posts</RkText>
          </View>
          <View style={styles.section}>
            <RkText rkType='header3' style={styles.space}>123</RkText>
            <RkText rkType='secondary1 hintColor'>Followers</RkText>
          </View>
          <View style={styles.section}>
            <RkText rkType='header3' style={styles.space}>890</RkText>
            <RkText rkType='secondary1 hintColor'>Following</RkText>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity>
            <RkText> Purchases </RkText>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text> Archives </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}


const styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base
  },

  header: {
    paddingTop: 25,
    paddingBottom: 17,
  },

  row: {
    flexDirection: 'row',

  },

  userInfo: {
    flexDirection: 'row',
    paddingVertical: 18,
  },

  bordered: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border.base
  },

  section: {
    flex: 1,
    alignItems: 'center'
  },

  space: {
    marginBottom: 3
  },

  separator: {
    backgroundColor: theme.colors.border.base,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 0,
    width: 1,
    height: 42
  },

  buttons: {
    flex: 1
  },

  button: {
    marginTop: 27.5,
    alignSelf: 'center'
  },

  buttonText: {
    color: '#ecf0f1'
  },

  bottomContainer: {
    paddingTop: 20
  },

  loImage: {
    height: 100,
    borderRadius: 150,
    width: 100
  }
}));

