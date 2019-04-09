import React, { Component } from 'react';
import { List, ListItem } from 'react-native-elements'
import { ScrollView, Share, Text, StyleSheet } from 'react-native';
import branch from 'react-native-branch'
import { observer, inject } from 'mobx-react/native';
import { firebaseRef } from '../../services/Firebase'

@inject("appStore") @observer
export default class Help extends Component {
  
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
    const { navigate } = this.props.navigation;
    const memberUid = this.props.appStore.user.uid;
    const name = firebaseRef.auth().currentUser.displayName;

    return (
      <ScrollView style={styles.root}>
        <Text style={styles.name}>{name}</Text>
        <List containerStyle={{marginBottom: 20}}>
          <ListItem
            leftIcon={{name:'notifications', color:'#27924a'}}
            title='Notifications'
            chevronColor='#27924a'
            // onPress={() => navigate('')}
            containerStyle={styles.lists}
            titleStyle={styles.listTitle}
          />
          <ListItem
            leftIcon={{name:'mail', color: '#27924a'}}
            title='Posts'
            chevronColor='#27924a'
            onPress={() => navigate('Archive')}
            containerStyle={styles.lists}
            titleStyle={styles.listTitle}
          />
          <ListItem
            leftIcon={{name:'folder-open', color: '#27924a'}}
            title='Orders'
            chevronColor='#27924a'
            onPress={() => navigate('Purchased')}
            containerStyle={styles.lists}
            titleStyle={styles.listTitle}
          />
          <ListItem
            leftIcon={{name:'share', color: '#27924a'}}
            title='Refer a friend'
            subtitle='Get $5 for each refferal'
            chevronColor='#27924a'
            onPress= {() => {this._inviting(memberUid)}}
            containerStyle={styles.lists}
            titleStyle={styles.listTitle}
            subtitleStyle={{paddingLeft: 10, fontSize: 14}}
            // leftIcon={{color: 'black'}}
          />
          <ListItem
            // leftIcon={require('../../assets/icons/blackwhite/help.png')}
            leftIcon={{name: 'info', color:'#27924a'}}
            title='Help'
            chevronColor='#27924a'
            onPress={() => navigate('Settings')} 
            containerStyle={styles.lists}
            titleStyle={styles.listTitle}
          />
          <ListItem
            leftIcon={{name:'settings', color: '#27924a'}}
            title='Settings'
            chevronColor='#27924a'
            onPress={() => navigate('Settings')}
            containerStyle={styles.lists}
            leftIconUnderlayColor='green'
            titleStyle={styles.listTitle}
          />
        </List>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create ({
  root: {
    backgroundColor: 'white'
  },

  name: {
    alignSelf: 'flex-end',
    fontSize: 25,
    marginHorizontal: 20,
    marginTop: 60,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  lists: {
    height: 60,
    // alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    justifyContent: 'space-between',
    paddingLeft: 10
  },
})
