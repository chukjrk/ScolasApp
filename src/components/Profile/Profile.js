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
import { Avatar, Icon, Header } from 'react-native-elements'
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
                <Text>PROMOTION</Text>
              </View>
              <View style={styles.modalHeader}>
                <Text>Share</Text>
                <Text>BooXchange</Text>
              </View>
              <View style={styles.modalInfo}>
                <Icon>
                </Icon>
                <TouchableHighlight onPress={() => { this.setModalVisible(!this.state.modalVisible); }}>
                  <Text>CLOSE</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>

        <ScrollView style={styles.root}>
          
          <View style={styles.container}>
            <View style={[styles.header, styles.bordered]}>
              <TouchableOpacity style= {{alignSelf: 'center'}} onPress={() => { this.setModalVisible(true);}} >
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
    backgroundColor: 'white',
    justifycontent: 'top',
    borderRadius: 4,
    borderColor: 'green',
    borderWidth: 3,
    marginHorizontal: 40,
    marginTop: 30,
    marginBottom: 40,
  },

  modalTitle: { 
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 5,
    padding: 2,
  },

  modalHeader: {
  },

  modalInfo: {

  }

}));

