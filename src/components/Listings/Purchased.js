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
  ScrollView
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import { firebaseRef } from '../../services/Firebase'
// import Icon from 'react-native-vector-icons/Ionicons'
import { observer,inject } from 'mobx-react/native'


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
    console.log("--------- MY ORDERS --------- " + uid)
    firebaseRef.database().ref('user_orders/'+ uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
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
      <ScrollView style={styles.container}>
        <ListView
          automaticallyAdjustContentInsets={true}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
        />
      </ScrollView>
    )
  }

  _renderRow = (data) => {
    const timeString = moment(data.updatedAt).fromNow()
    return (
      <TouchableOpacity>
        <View style={styles.card}>
          <View style={styles.content}>
            <View style={styles.HeaderContainer}>
              <Text style={styles.title}>{ data.title }</Text>
              <Text style={styles.info}>{data.price}</Text>
              <Text style={styles.info}>{timeString}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _onEndReached = () => {
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 10 })
      this.setState({ isLoading: true })
      firebaseRef.database().ref('user_orders/'+ this.props.appStore.user.uid +'/posts').off()
      firebaseRef.database().ref('user_orders/'+ this.props.appStore.user.uid +'/posts').orderByChild('createdAt').limitToLast(this.state.counter+10).on('value',
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
    this.props.navigation.navigate('Chat',{ title:postData.title, puid: postData.puid, uid:this.props.appStore.user.uid});
  }

  componentWillUnmount() {
    firebaseRef.database().ref('user_orders/'+ this.props.appStore.user.uid +'/posts').off()
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
  RawContainer: {
    flexDirection: 'row',
    flex: 1,
    //borderWidth: 1,
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
    //borderWidth: 1,
  },
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
})

// renderitem previous display
// <TouchableOpacity >
//         <View style={styles.card}>
//           <Text style={styles.title}>{ data.title }</Text>
//           <Text style={styles.info}>{data.price}</Text>
//           <Text style={styles.info}>{timeString}</Text>
//         </View>
//       </TouchableOpacity>