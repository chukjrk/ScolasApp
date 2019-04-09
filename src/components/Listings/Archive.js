import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Alert
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import { firebaseRef } from '../../services/Firebase'
import firebase from 'firebase';
// import Icon from 'react-native-vector-icons/Ionicons'
import { observer,inject } from 'mobx-react/native'
import Swipeable from 'react-native-swipeable';
import { Header, Icon } from 'react-native-elements'


@inject("appStore") @observer
export default class Profile extends Component {
  static navigationOptions = {
    // title: `${navigation.state.params.title}`,
    headerTitleStyle: {
      alignSelf: 'center',
      paddingRight: 56,
    },
  };

  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      isLoading: true,
      isFinished: false,
      counter: 10,
      isEmpty: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    const uid = this.props.appStore.user.uid
    console.log("--------- MY POSTS --------- " + uid)
    firebaseRef.database().ref('user_posts/'+ uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
    (snapshot) => {
      console.log("USER POST RETRIEVED");
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
        })
      }
      else {
        this.setState({ isEmpty: true })
      }
      this.setState({ isLoading: false })
    })
  }

  componentDidUpdate() {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  render() {
    return (
      <View style={styles.container}>

          <ListView
            automaticallyAdjustContentInsets={true}
            initialListSize={1}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            renderFooter={this._renderFooter}
            onEndReached={this._onEndReached}
            onEndReachedThreshold={1}
          />
      </View>
    )
  }

  _renderRow = (data) => {
    // let index = 0;
    // const options = [
    //     { key: index++, section: true, label: 'Status' },
    //     { key: index++, label: 'available' },
    //     { key: index++, label: 'released' },
    //     { key: index++, label: 'sold' },
    //     { key: index++, label: 'closed' },
    // ]
    const timeString = moment(data.updatedAt).fromNow()
    // const Status = (data.status === 'available') ? <Text style={{fontWeight:'bold',color:"green"}}>{data.status.toUpperCase()}</Text> : <Text style={{fontWeight:'bold',color:"red"}}>{data.status.toUpperCase()}</Text>
    return (
      <ScrollView>
        <Swipeable
        rightButtons={[
          <TouchableOpacity style={[styles.rightSwipeItem, {backgroundColor: '#f94a4a'}]} onPress={() => this._flagPost(data)}>
            <Icon style={[styles.flagicon]} name='close' color='white' />
          </TouchableOpacity>,
          // onRightButtonsOpenRelease={onOpen}
          // onRightButtonsCloseRelease={onClose}
        ]}>
        <TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.content}>
              <View style={styles.HeaderContainer}>
                <Text style={styles.title}>{ data.title }</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </ScrollView>
    )
  }

  _flagPost = (postData) => {
    // console.log("--------> FLAG !!!!!!")
    // console.log(postData)
    // console.log(postData.puid)
    const uid = this.props.appStore.user.uid
    firebaseRef.database().ref('posts').child(postData.puid).remove().then(() =>{
      Alert.alert(
        'Post Deleted',
        'Your book has been removed from the marketplace',
        [
          { text: 'OK', onPress: () => {
            firebaseRef.database().ref('messages_notif/' + postData.puid).update({
              deleted: true,
              deletedAt: firebase.database.ServerValue.TIMESTAMP,
            })
          }},
        ]
      )
    }).catch((error) => {
      console.log('deletion error', error)
    })
    firebaseRef.database().ref('/user_posts/'+ uid + '/posts').child(postData.puid).remove()
  }

  _changeStatus = (option, postData) => {
    console.log("NEW STATUS: " + option.label)
    firebaseRef.database().ref('posts').child(postData.puid).update( { status:option.label } )
    firebaseRef.database().ref('user_posts/'+postData.uid+'/posts').child(postData.puid).update( { status:option.label } )
    if (postData.clientId) {
      firebaseRef.database().ref('user_orders/'+postData.clientId+'/posts').child(postData.puid).update( { status:option.label } )
      firebaseRef.database().ref('posts').child(postData.puid).update( { clientId:"",clientName:"" } )
    }
  }

  _onEndReached = () => {
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 10 })
      this.setState({ isLoading: true })
      firebaseRef.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').off()
      firebaseRef.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter+10).on('value',
      (snapshot) => {
        console.log("---- USER POST RETRIEVED ----");
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          this.setState({ isFinished: true })
          console.log("---- USER POST FINISHED !!!! ----")
        }
        if (snapshot.val()) {
          this.setState({ isEmpty: false })
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
          })
        }
        this.setState({ isLoading: false })
      })
    }
  }

  _renderFooter = () => {
    if (this.state.isLoading) {
      return (
        <View style={styles.waitView}>
          <ActivityIndicator size='large'/>
        </View>
      )
    }
    if (this.state.isEmpty) {
      return (
        <View style={styles.waitView}>
          <Text>- . . . -</Text>
        </View>
      )
    }
  }

  _openChat = (postData) => {
    this.props.navigation.navigate('Chat',{ title:postData.title, puid:postData.puid, uid:this.props.appStore.user.uid});
  }


  componentWillUnmount() {
    firebaseRef.database().ref('user_posts/'+ this.props.appStore.user.uid +'/posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#f9f9f9'
  },
  profileInfoContainer: {
    flexDirection: 'row',
    height: 65,
    margin: 5,
    borderRadius: 2,
    // backgroundColor: getColor()
  },
  profileNameContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileName: {
    marginLeft: 10,
    fontSize: 20,
    color: '#fff',
  },
  profileCountsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5
  },
  profileCounts: {
    fontSize: 30,
    color: '#fff'
  },
  countsName: {
    fontSize: 12,
    color: '#ffffff'
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  RawContainer: {
    flexDirection: 'row',
    flex: 1,
    //borderWidth: 1,
    marginLeft: 5,
  },
  LeftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    //borderWidth: 1,
  },
  RightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 10,
    padding: 10,
    //borderWidth: 1,
    //backgroundColor:'#000',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    color: '#444',
  },
  info: {
    padding: 3,
    fontSize: 13,
  },
  flagicon: {
    alignItems: 'flex-start',
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },

  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },

})

// <TouchableOpacity onPress={() => this._openChat(data)}>
//         <View style={styles.card}>
//           <View style={styles.RawContainer}>
//             <View style={styles.LeftContainer}><Text style={styles.title}>{ data.title }</Text></View>
//           </View>
//           <View style={styles.RawContainer}>
//             <View style={styles.RightContainer}>
//               {/*<ModalPicker data={options} onChange={ (option)=>this._changeStatus(option, data) }>
//                 { Status }
//               </ModalPicker>*/}
//             </View>
//           </View>
//           <View style={styles.RawContainer}>
//             <Text style={styles.info}>{timeString}</Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//for previous return();
// <View style={styles.profileInfoContainer}>
//           {/*<View style={styles.profileNameContainer}>
//             <Text style={styles.profileName}>
//               {this.props.appStore.username}
//             </Text>
//           </View>
//           <View style={styles.profileCountsContainer}>
//             <Text style={styles.profileCounts}>
//               {this.props.appStore.post_count}
//             </Text>
//           </View>*/}
//           <View style={styles.profileCountsContainer}>
//             {/*<TouchableOpacity onPress={this._userEdit}>
//               <Icon name='md-settings' size={30} color='rgba(255,255,255,.9)'/>
//             </TouchableOpacity>*/}
//           </View>
//           <View style={styles.profileCountsContainer}>
//             {/*<TouchableOpacity onPress={this._logOut}>
//               <Icon name='md-log-out' size={30} color='rgba(255,255,255,.9)'/>
//             </TouchableOpacity>*/}
//           </View>
//         </View>