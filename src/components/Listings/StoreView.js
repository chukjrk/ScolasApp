import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  ListView,
  Alert,
  RefreshControl
} from 'react-native'
import { StackNavigator, NavigationActions  } from 'react-navigation'
import { RkText, RkButton, RkStyleSheet, RkTextInput } from 'react-native-ui-kitten';
import _ from 'lodash';
import moment from 'moment';
import { SearchBar } from 'react-native-elements'
import { firebaseRef } from '../../services/Firebase'
import Chat from '../../components/Chat/Chat'
import Rebase from 're-base'; //import rebase
import Book from '../Listings/Book'
import { observer,inject } from 'mobx-react/native';
import BackgroundTask from 'react-native-background-task'

let base = Rebase.createClass(firebaseRef.database()); //initiate rebase with firebase setup

const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class StoreView extends Component {

  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      counter: 1,
      isLoading: true,
      isEmpty: false,
      isFinished: false,
      searchText: '',
      refreshing: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }

    this._setSearchText = this._setSearchText.bind(this)
  }

  componentDidMount() {
    console.log("--------- TIMELINE --------- " + this.state.counter)
    firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
    (snapshot) => {
      console.log("---- TIMELINE POST RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
      }
      else {
        this.setState({ isEmpty: true })
      }
      this.setState({ isLoading: false })
    })
    // BackgroundTask.schedule({period: 1200})
  }

  componentDidUpdate() {
    //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  //filter post execute here
  filterPosts(searchText, posts) {
    let text = searchText.toLowerCase();
    console.log(text)
    return _.filter(posts, (n) => {
      let post = n.title.toLowerCase(); //change title to any name that exist in firebase's child
      return post.search(text) !== -1;
    });
  }

  _setSearchText() {
    // const searchText = this.state.searchText
    // this.setState({ isLoading: true })
    // if (searchText == ""){
    //   firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter).on('value',
    //   (snapshot) => {
    //     if (snapshot.val()) {
    //       this.setState({ isEmpty: false })
    //       this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
    //     }
    //     else {
    //       this.setState({ isEmpty: true })
    //     }
    //     this.setState({ isLoading: false })
    //   })
    // } else {
    //   this.setState({refreshing: true});
    //   firebaseRef.database().ref('posts').orderByChild('createdAt').equalTo(searchText).limitToLast(this.state.counter).on("value",
    //   (snapshot) => {
    //     if (snapshot.val()) {
    //       this.setState({ isEmpty: false })
    //       this.setState({ dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))) })
    //     }
    //     else {
    //       this.setState({ isEmpty: true })
    //     }
    //     this.setState({ isLoading: false })
    //     this.setState({refreshing: false});
    //   })
    // }
    const searchText = this.state.searchText
    this.setState({ isLoading: true })
    base.fetch("posts", {
      context: this,
      asArray: true,
      queries: {
        // can add more options. see rebase react for more info
        orderByChild:'createdAt'
      },
      then(data){
        console.log(data);
        let filteredData = this.filterPosts(searchText, data);
        console.log(filteredData);
        this.setState({
          isLoading: false,
          dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(filteredData)))
        });
      }
    });
  }

  static deletePost(postData){
    firebaseRef.database().ref('posts').child(postData.puid).remove()
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          value={this.state.searchText}
          // onChangeText={this._setSearchText.bind(this)}
          onChangeText={(text) => this.setState({searchText: text})}
          placeholder='Search Books'
          onChange={this._setSearchText.bind(this)} // added onChange to make live search
          lightTheme
          clearIcon
          onSubmitEditing={() => this._setSearchText()}
          returnKeyType= "go" />
        <ListView
          automaticallyAdjustContentInsets={false}
          initialListSize={1}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={1}
          enableEmptySections={true}
          // refreshControl= {
            //< RefreshControl
              // refreshing={this.state.refreshing}
              // onRefresh= {this.setSearchText.bind(this)} />
          // }
        />
      </View>
    )
  }

  _renderRow = (data) => {
    //console.log("TIMELINE :::: _renderRow " + data.title)
    const timeString = moment(data.createdAt).fromNow()
    const height = screenWidth*data.imageHeight/data.imageWidth
    const shareOptions = {
      title: data.title + " for sale",
      url: "http://scolas.shop/post/" + data.puid,
      subject: "Share this item"
    }
    const BuyButton = (data.status === 'available') ?
            <TouchableOpacity style={styles.button} onPress={() => this._BookPage(data)}>
              <RkText>Here</RkText>
            </TouchableOpacity>
          : null
    const Status = ( data.status === 'available') ? <Text style={{fontWeight:'bold',color:"green"}}>{data.status.toUpperCase()}</Text> : <Text style={{fontWeight:'bold',color:"red"}}>{data.status.toUpperCase()}</Text> 
    // data.status === 'sold' ? firebaseRef.database().ref('posts').child(data.puid).remove() : null

    if (data.status == 'available'){
      return (
        <TouchableWithoutFeedback onPress={() => this._BookPage(data)}>
          <View style={styles.card}>
            <Image
              source={{ uri:data.image }}
              resizeMode='contain'
              style={{
                height: 150,
                width: 120,
                alignSelf: 'flex-start',
              }}
            />

            <View style={styles.postInfo}>
              <Text style={styles.title}>{ data.title }</Text>
              <Text style={{fontStyle: 'italic', flexWrap: 'wrap'}}>{data.Author}</Text>
              <Text style={styles.info}><Text style={styles.bold}>{data.username}</Text> - {timeString}</Text>
              {/* { data.text ? <Text style={styles.info}>{ data.text }</Text> : null }*/}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return(
        null
      )
    }
  }

  _BookPage = (postData) => {
    this.props.navigation.navigate('Book',{ title:postData.title, puid:postData.puid, uid:postData.uid });

    //Since that Chat navigator in router.js was using StackNavigator,  this.props.navigation.navigate required to
    // handle navigation
  }

  _onEndReached = () => {
    //console.log("TIMELINE ----> _onEndReached :+++:");
    if (!this.state.isEmpty && !this.state.isFinished && !this.state.isLoading) {
      this.setState({ counter: this.state.counter + 1 })
      this.setState({ isLoading: true })
      firebaseRef.database().ref('posts').off()
      firebaseRef.database().ref('posts').orderByChild('createdAt').limitToLast(this.state.counter+1).on('value',
      (snapshot) => {
        this.setState({ isFinished: false })
        console.log("---- TIMELINE POST ON END RETRIEVED ---- "+ this.state.counter +" - "+ _.toArray(snapshot.val()).length)
        if (_.toArray(snapshot.val()).length < this.state.counter) {
          console.log("---- TIMELINE POST FINISHED ----");
          this.setState({ isFinished: true })
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
          <Text>Nothing there yet.</Text>
        </View>
      )
    }
  }

  componentWillUnmount() {
    console.log("---- TIMELINE UNMOUNT ---")
    firebaseRef.database().ref('posts').off()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    // margin: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#d6d7da'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#444',
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  postInfo: {
    padding: 5,
    // alignItems: 'center',
  },
  postButtons: {
    padding: 5,
    flex: 1,
    alignItems: 'center',
  },
  button: {
    flex: 3,
    padding: 5,
    margin: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    alignSelf: 'flex-start'
  },
  info: {
    fontSize: 15,
    flexWrap: 'wrap'
  },
  bold: {
    fontWeight: 'bold',
  },
})
