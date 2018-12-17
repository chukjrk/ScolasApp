import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  AsyncStorage,
  TouchableHighlight,
  Platform,
  PixelRatio
} from 'react-native';
import { RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten';
import { Avatar, Icon, Header, Button } from 'react-native-elements'
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
import { observer,inject } from 'mobx-react/native';
import { StackNavigator, NavigationActions } from 'react-navigation'
import Modal from 'react-native-modal'
import branch from 'react-native-branch'
import { firebaseRef } from '../../services/Firebase'
import Onesignal from 'react-native-onesignal'
// import {vw, vh} from 'react-native-viewport-units'

@inject("appStore") @observer
export default class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalVisible2: false,
    }
  }

  componentDidMount() {
    this.setModalVisible(true);
    console.log("Device_id: ", this.props.appStore.device_id)
  }

  componentWillMount() {
    // OneSignal.init("YOUR_ONESIGNAL_APPID");
    // OneSignal.configure(); //will trigger ids event to fire.
    // OneSignal.addEventListener('ids', this.onIds);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onIds(device) {
    console.log('Device info: ', device); //your playerId
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  setModalVisible2(visible) {
    this.setState({modalVisible2: visible});
  }

  _showResult(result) {
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

  render() {
    const i = []
    var user = firebaseRef.auth().currentUser;
    if (user != null) {
      user.providerData.forEach(function (profile) {
        i.push(profile.providerId)
      });
    }
    if (i[0] == 'facebook.com') {
      i.push(user.displayName)
    } else {
      i.push(JSON.stringify(this.props.appStore.username))
    }
    const name = i[1];
    const points = this.props.appStore.user_point;
    const { navigate } = this.props.navigation;
    const memberUid = this.props.appStore.user.uid;

    return (
      <StickyHeaderFooterScrollView
        renderStickyHeader={() => (
        <Header
        centerComponent={{ text: 'HOME', style: { color: '#fff', fontSize: 20 } }}
        outerContainerStyles= {{ backgroundColor:'#27924a' }} //backgroundColor: '#01579B'}}
        />
      )}>

        <View>
          <Modal
          animationType="slide"
          // transparent={false}
          isVisible={this.state.modalVisible}
          style={styles.promoContainer}
          backdropOpacity = {0.5}
          onBackButtonPress = {() => {this.setModalVisible(!this.state.modalVisible)}}
          >
            <View>
              <View style={styles.modalTitle}>
                <Text style={{opacity: 0.5}}>P</Text>
                <Text style={{opacity: 0.5}}>R</Text>
                <Text style={{opacity: 0.5}}>O</Text>
                <Text style={{opacity: 0.5}}>M</Text>
                <Text style={{opacity: 0.5}}>O</Text>
                <Text style={{opacity: 0.5}}>T</Text>
                <Text style={{opacity: 0.5}}>I</Text>
                <Text style={{opacity: 0.5}}>O</Text>
                <Text style={{opacity: 0.5}}>N</Text>
              </View>
              <View style={styles.modalHeader}>
                <Text style={{fontSize: 45, fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : null}}>SHARE</Text>
                <Text style={{fontSize: 45, marginBottom: 15, fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : null}}>BOOXCHANGE</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={{fontSize: 25, color: '#27924a'}}>3 INVITES</Text>
                <Text style={{fontSize: 25, color: '#27924a'}}>1 POINT</Text>
              </View>
              <View style={styles.modalButtons}>
                <Icon
                  name='share'
                  size= {50}
                  color='#00aced'
                  onPress= {() => {this._inviting(memberUid)}}
                  iconStyle={{
                    marginHorizontal: 30,
                    opacity: 0.7,
                    elevation: 0.1
                  }} />
                <Button
                  title='CLOSE'
                  onPress={() => {this.setModalVisible(!this.state.modalVisible)}}
                  titleStyle={{ 
                    fontWeight: '20',
                    fontSize: 10,
                  }}
                  buttonStyle={{
                    alignSelf: 'flex-end',
                    marginRight: 15,
                    width: 130,
                    height: 45,
                    // opacity: 0.7,
                    backgroundColor: '#e1e0e0',
                    elevation: 0.1
                  }}
                />
              </View>
            </View>
          </Modal>

          <Modal
          animationType="slide"
          // transparent={false}
          isVisible={this.state.modalVisible2}
          style={styles.promoContainer}
          backdropOpacity = {0.5}
          onBackButtonPress = {() => {this.setModalVisible2( false )}}
          >
            <View>
              <View style={styles.infoTitle}>
                <Text style={{opacity: 0.5, fontWeight: 'bold', fontSize: 20, alignSelf: 'center', justifyContent: 'space-between'}}>INFO</Text>
              </View>
              <View>
                <Text style={styles.infoHeader}>How does BooXchange work?</Text>
                <Text style={styles.infoExpand}>BooXchange works with a point system. You get books by usng the points you earn. All boooks on BooXchange are 1 point.</Text>
              </View>
              <View>
                <Text style={styles.infoHeader}>How do you earn points?</Text>
                <Text style={styles.infoExpand}>You earn points for the textbooks you trade. You get 1 point by putting your book on BooXchange.</Text>
              </View>
              <View>
                <Text style={styles.infoHeader}>Have not received textbook:</Text>
                <Text style={styles.infoExpand}>If you have not received your textbook from a BooXchange member, head to your 'Chats'. Swipe left on the chat of the incomplete transaction. Tap the report flag and the transaction be cleared and taken care off.</Text>
              </View>
              <View style={styles.infoButton}>
                <Button
                  title='CLOSE'
                  onPress={() => {this.setModalVisible2(!this.state.modalVisible2)}}
                  titleStyle={{ 
                    fontWeight: '20',
                    fontSize: 10,
                  }}
                  buttonStyle={{
                    alignSelf: 'center',
                    margin: 10,
                    width: 130,
                    height: 45,
                    // opacity: 0.7,
                    backgroundColor: 'skyblue',
                    elevation: 0.1
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>

        <ScrollView style={styles.root}>
         
          <View style={styles.container}>
            <View style={[styles.header, styles.bordered]}>
              <View style= {{alignSelf: 'center'}}> 
                <Avatar
                  rounded
                  xlarge
                  title = {name.charAt(0).toUpperCase()}
                  overlayContainerStyle={{backgroundColor: ('#FFCA28', '#C62828', '#9CCC65', '#42A5F5') }}/>
                  {/*source={require('../../assets/images/faceO.jpeg')} />*/}
              </View>
              <View style={styles.section}>
                <RkText rkType='header2' style={{fontSize: 18}}>{name}</RkText>
              </View>
            </View>

            <View style={styles.userInfo}>
              <TouchableOpacity  style={styles.section} onPress={() => navigate('Settings')}>
                <TouchableOpacity style={styles.buttons, { paddingTop: 17}} onPress={() => navigate('Settings')}>
                  <Icon
                    name='settings'
                    color='grey'
                    />
                </TouchableOpacity>
              </TouchableOpacity>
                <View style={styles.section}>
                  <RkText rkType='header3' style={styles.space}>{points}</RkText>
                  <RkText rkType='secondary1 hintColor'>Points</RkText>
                </View>
                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.buttons, { paddingTop: 17, alignItems: 'center', paddingVertical: 10}} onPress = {() => {this.setModalVisible2( true )}} >
                    <Icon
                      name='info'
                      color='grey'
                      />
                  </TouchableOpacity>
                </View>
            </View>
          </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.purchase} onPress={() => navigate('Purchased')}>
            <Icon name='history' color= '#898989'/>
            <Text style={{fontSize: 16, paddingLeft: 7}}> Purchases </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.archive} onPress={() => navigate('Archive')}>
            <Icon name='archive' color= '#898989'/>
            <Text style={{fontSize: 16, paddingLeft: 7}}> Archives </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </StickyHeaderFooterScrollView>
    );
  }
}


const styles = RkStyleSheet.create(theme => ({
  root: {
    flex: -1,
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
  },

  promoContainer: {
    flex: 1,
    // justifyContent: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 4,
    width: PixelRatio.getPixelSizeForLayoutSize(90),
    // height: PixelRatio.getPixelSizeForLayoutSize(100),
    alignSelf: 'center',
    // marginHorizontal: 40,
    marginTop: PixelRatio.getPixelSizeForLayoutSize(20),
    marginBottom: PixelRatio.getPixelSizeForLayoutSize(40),
  },

  modalTitle: {
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 2,
    borderBottomColor: '#93c8a4',
    flexDirection: 'row',
    marginHorizontal: 4,
  },

  modalHeader: {
    marginTop: 30,
    alignItems: 'center',
  },

  modalInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    borderWidth: 12,
    borderRadius: 5,
    margin: 15,
    borderColor: '#93c8a4',
    elevation: 1,
    shadowColor: '#fbf8f8',
    shadowOpacity: 0.3,
    justifyContent: 'space-between'
  },

  modalButtons: {
    alignContent: 'center',
    // marginTop: 10,
    flexDirection: 'row',
  },

  infoHeader: {
    fontWeight: 'bold',
    marginHorizontal: 7,
  },

  infoExpand: {
    marginBottom: 10,
    // marginTop: 2,
    marginHorizontal: 7,
  },

  infoButton:{
    alignSelf: 'center',
  },

  infoTitle: {
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 2,
    borderBottomColor: '#93c8a4',
    marginHorizontal: 5,
    marginBottom: 8
  },

}));


