import React, { Component, PropTypes } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  AsyncStorage,
  TouchableHighlight
} from 'react-native';
import { RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten';
import { Avatar, Icon, Header, Button } from 'react-native-elements'
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
import { observer,inject } from 'mobx-react/native';
import { StackNavigator, NavigationActions } from 'react-navigation'
import { firebaseRef } from '../../services/Firebase'
import Modal from 'react-native-modal'

@inject("appStore") @observer
export default class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  componentDidMount() {
    this.setModalVisible(true);
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  _showResult(result){
    this.setState({result});
  }
  _inviting(){
    firebase.links()
      .createDynamicLink({
        dynamicLinkDomain: "nf6vn.app.goo.gl/rnix",
        link: "https://booXchange.com/?invitedby=" + this.props.appStore.user.uid,
        androidInfo: {
          androidPackageName: "com.booxchange"
        },
        suffix: {
          option: this.props.appStore.user.uid
        },
      })
      .then((url) => {
        // url: link
        this.setState({sendlink: url})
        Share.share({
          title: 'Whyyye',
          message: 'Inviting you to BooXchange ' + url,
        }).then(this._showResult); 
        console.log("---- This ish is URL BABABABABAS ---", url)
    });
  }

  render() {
    const name = this.props.appStore.username;
    const points = this.props.appStore.user_point;
    const { navigate } = this.props.navigation;

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
                <Text style={{fontSize: 45, fontFamily: 'sans-serif-condensed'}} >SHARE</Text>
                <Text style={{fontSize: 45, marginBottom: 15, fontFamily: 'sans-serif-condensed'}}>BOOXCHANGE</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={{fontSize: 25, color: '#27924a'}}>5 INVITES</Text>
                <Text style={{fontSize: 25, color: '#27924a'}}>1 POINT</Text>
              </View>
              <View style={styles.modalButtons}>
                <Icon
                  name='share'
                  size= {50}
                  color='#00aced'
                  onPress= {this._inviting}
                  iconStyle={{
                    marginHorizontal: 30,
                    opacity: 0.7,
                    elevation: 0.1
                  }} />
                <Button
                  title='CLOSE'
                  onPress={() => { this.setModalVisible(!this.state.modalVisible); }}
                  titleStyle={{ 
                    fontWeight: '20',
                    fontSize: 10,
                  }}
                  buttonStyle={{
                    alignSelf: 'flex-end',
                    margin: 15,
                    width: 120,
                    height: 45,
                    // opacity: 0.7,
                    backgroundColor: '#e1e0e0',
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
              <TouchableOpacity style= {{alignSelf: 'center'}}> 
                <Avatar
                  rounded
                  xlarge
                  title = {name.charAt(0).toUpperCase()}
                  overlayContainerStyle={{backgroundColor: ('#FFCA28', '#C62828', '#9CCC65', '#42A5F5') }}/>
                  {/*source={require('../../assets/images/faceO.jpeg')} />*/}
              </TouchableOpacity>
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
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 4,
    marginHorizontal: 40,
    marginTop: 40,
    marginBottom: 100,
  },

  modalTitle: {
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 2,
    borderBottomColor: '#93c8a4',
    flexDirection: 'row'
  },

  modalHeader: {
    marginTop: 30,
    alignItems: 'center',
  },

  modalInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    borderWidth: 12,
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
  }

}));


