import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten';
import { Avatar, Icon, Header } from 'react-native-elements'
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
import { observer,inject } from 'mobx-react/native';
import { StackNavigator, NavigationActions  } from 'react-navigation'

@inject("appStore") @observer
export default class Profile extends React.Component {

  render() {
    const name = this.props.appStore.username;
    const points = this.props.appStore.user_point;
    const { navigate } = this.props.navigation;

    return (
      <StickyHeaderFooterScrollView 
        renderStickyHeader={() => (
        <Header 
        centerComponent={{ text: 'HOME', style: { color: '#fff', fontSize: 20 } }}
        outerContainerStyles= {{ backgroundColor: '#01579B'}}
        />
      )}>

        <ScrollView style={styles.root}>
          <View style={styles.container}>
            <View style={[styles.header, styles.bordered]}>
              <View style= {{alignSelf: 'center'}}>
                <Avatar
                  rounded
                  xlarge 
                  source={require('../../assets/images/faceO.jpeg')} />
              </View>
              <View style={styles.section}>
                <RkText rkType='header2' style={{fontSize: 18}}>{name}</RkText>
              </View>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.section}>
              {/*<RkText rkType='header3' style={styles.space}>12</RkText>*/}
              <TouchableOpacity style={styles.buttons, { paddingTop: 17}} onPress={() => navigate('Settings')}>
                <Icon 
                  name='settings'
                  />
                  {/*<Text onPress={() => navigate('Register')} > Set </Text>*/}
                {/*<RkText rkType='moon large primary' style={styles.buttonText}>Sign Out</RkText>*/}
                {/*</RkButton>*/}
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <RkText rkType='header3' style={styles.space}>{points}</RkText>
              <RkText rkType='secondary1 hintColor'>Points</RkText>
            </View>
            <View style={styles.buttons}>
              <Icon 
                name='settings'
                type='material-icons' />
            </View>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.purchase}>
            <Icon name='history' color= '#898989' />
            <Text style={{fontSize: 16, paddingLeft: 7}}> Purchases </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.archive}>
            <Icon name='archive' color= '#898989'/>
            <Text style={{fontSize: 16, paddingLeft: 7}} > Archives </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </StickyHeaderFooterScrollView>
    );
  }
}


const styles = RkStyleSheet.create(theme => ({
  root: {
    flex: -1.5,
    paddingTop: 15,
    backgroundColor: '#f0f0f0'
  },

  header: {
    // paddingTop: 25,
    // paddingBottom: 17,
  },

  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 15,
    margin: 10,
    marginBottom: 20,
    paddingTop: 15,
    paddingBottom:5,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    backgroundColor: '#fff'
  },

  row: {
    flexDirection: 'row',
  },

  userInfo: {
    flexDirection: 'row',
    paddingVertical: 5,
  },

  bordered: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border.base
  },

  section: {
    flex: 1,
    alignItems: 'center',
    paddingVertical:10,
    borderRightWidth: 1,
    borderColor: '#eeeeee'
    // borderLeftWidth: 1
  },

  space: {
    marginBottom: 3,
    fontSize: 25,
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
    flex: 1,
    alignSelf: 'center'
  },

  button: {
    marginTop: 27.5,
    alignSelf: 'center'
  },

  buttonText: {
    color: '#ecf0f1'
  },

  bottomContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    marginBottom: 40,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
    shadowColor: '#000'
  },

  stickyheader: {
    color: '#fff'
  },

  archive: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000'
  },

  purchase: {
    flexDirection: 'row',
    padding: 15,
  }
}));

