import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { RkText, RkButton, RkStyleSheet, RkTextInput } from 'react-native-ui-kitten';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import { firebaseRef } from '../../services/Firebase';
import firebase from 'firebase';
import { Actions } from 'react-native-router-flux';
import { observer,inject } from 'mobx-react/native';
import { navigationOptions } from 'react-navigation';
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
import { Header, Button } from 'react-native-elements'


const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const screenWidth = Dimensions.get('window').width

const uploadImage = (uri, imageName, mime = 'image/jpg') => {
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null
      const imageRef = firebaseRef.storage().ref('posts').child(imageName)
      fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

@inject("appStore") @observer
export default class CreateNew extends Component {
	constructor(props){
		super(props)
		this.state = {
			postStatus: null,
			postText: '',
			postTitle: '',
			Author: '',
 			imagePath: null,
			imageHeight: null,
			imageWidth: null,
		}
	}

	render() {
    const height = ((screenWidth-40)*this.state.imageHeight/this.state.imageWidth)
    const photo = this.state.imagePath ?
      <View style={{ flex:1, }}>
        <Image
          source={{ uri:this.state.imagePath }}
          resizeMode='contain'
          style={{
            height: height,
            width: screenWidth-40,
            alignSelf: 'center',
            marginBottom: 10,
          }}
        />
      </View>
     :
       <View style={{ flex:1, marginBottom: 10,}}>
         <Image
           style={{
             height: 100,
             width: 100,
             backgroundColor:'#4285f4',
             alignSelf: 'center',
             borderRadius: 5,
           }}
         />
       </View>
    return (
      <View style={styles.container}>
      {/*<StickyHeaderFooterScrollView 
        renderStickyHeader={() => (
          <Header
            centerComponent={{ text: 'NEW ITEM', style: { color: '#fff', fontSize: 20 } }}
            outerContainerStyles= {{ backgroundColor: '#01579B'}}/>
        )}>*/}
        <ScrollView showsVerticalScrollIndicator={false} ref='scrollContent'>

          <RkText style={styles.title}>{'PICTURE'}</RkText>
          { photo }
          <Button
            small
            icon={{name: 'add'}}
            onPress={this._takePicture}
            buttonStyle={{width: 180, borderRadius: 2, alignSelf: 'center' }}
             />            
          <RkText style={styles.message}>{this.state.postStatus}</RkText>
          <View style={styles.titleContainer}>
            <TextInput
            style={styles.inputField}
            value={this.state.postTitle}
            onChangeText={(text) => this.setState({ postTitle: text })}
            underlineColorAndroid='transparent'
            placeholder='Title'
            placeholderTextColor='rgba(0,0,0,.6)'
            onSubmitEditing={(event) => {
              this.refs.SecondInput.focus();
            }} />
          </View>
          <View style={styles.titleContainer}>
            <TextInput
            ref='SecondInput'
            style={styles.inputField}
            value={this.state.Author}
            onChangeText={(text) => this.setState({ Author: text })}
            underlineColorAndroid='transparent'
            placeholder='Author'
            placeholderTextColor='rgba(0,0,0,.6)'
            onSubmitEditing={(event) => {
              this.refs.ThirdInput.focus();
            }} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
            ref='ThirdInput'
            multiline={true}
            style={styles.inputField}
            underlineColorAndroid='transparent'
            placeholder='Item Description'
            value={this.state.postText}
            //returnKeyType= "g"
            onChangeText={(text) => this.setState({ postText: text })}
            placeholderTextColor='rgba(0,0,0,.6)'
            />
          </View>
          {/* Conditoin Checking
          	<View style={styles.titleContainer}>
            <TextInput
            style={styles.inputField}
            value={this.state.postTitle}
            onChangeText={(text) => this.setState({ postTitle: text })}
            underlineColorAndroid='transparent'
            placeholder='Description'
            placeholderTextColor='rgba(0,0,0,.6)'
            onSubmitEditing={(event) => {
              this.refs.SecondInput.focus();
            }} />
          </View>*/}
          <Button
            raised
            icon={{name: 'send'}}
            onPress={this._handleNewPost}
            title= 'POST'
            backgroundColor= '#397af8'
            fontWeight= '800' />
        </ScrollView>
      </View>
      // </StickyHeaderFooterScrollView>
    )
  }

  _Store() {
		Actions.storeview()
	}

  _takePicture = () => {
    const cam_options = {
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      quality: 1,
      noData: true,
    };
    ImagePicker.showImagePicker(cam_options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error) {
        console.log(error.message)
      }
      else {
        this.setState({
          imagePath: response.uri,
          imageHeight: response.height,
          imageWidth: response.width,
        })
      }
    })
  }

  _handleNewPost = () => {
    this.setState({
      postStatus: 'Posting...',
    })
    if (this.state.imagePath) {
      if (this.state.postTitle.length > 0) {
        if (this.state.Author.length > 0) {
          this.setState({ spinnervisible: true })
          const uid = this.props.appStore.user.uid
          const username = this.props.appStore.user.displayName
          const newPostKey = firebaseRef.database().ref('posts').push().key
          const imageName = `${newPostKey}.jpg`
          uploadImage(this.state.imagePath, imageName)
          .then(url => {
            fetch('https://onesignal.com/api/v1/notifications',
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.props.appStore.onesignal_api_key,
              },
              body: JSON.stringify(
              {
                app_id: this.props.appStore.onesignal_app_id,
                included_segments: ["All"],
                headings: {"en": "New item"},
                android_sound: "fishing",
                data: {"puid": newPostKey},
                big_picture: url,
                ios_sound: "fishing.caf",
                contents: {"en": this.props.appStore.user.displayName + " just added a new item: " + this.state.postTitle + " by " + this.state.Author	},
                //filters: [{"field":"tag","key":"username","relation":"=","value":"Herve"}],
              })
            })
            .then((responseData) => {
                console.log("Push POST:" + JSON.stringify(responseData));
            })
            .done()
            console.log(this.state.postText);
            const postData = {
              username: username,
              uid: uid,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
              status: "available",
              clientId: "",
              clientName: "",
              new_messages: 0,
              text: this.state.postText.replace(/(\r\n|\n|\r)/gm,""),
              title: this.state.postTitle,
              price: this.state.postPrice,
              Author: this.state.Author,
              puid: newPostKey,
              image: url,
              imageHeight: this.state.imageHeight,
              imageWidth: this.state.imageWidth,
            }
            let updates = {}
            this.props.appStore.post_count = this.props.appStore.post_count + 1
            updates['/users/' + uid + '/post_count'] = this.props.appStore.post_count
            this.props.appStore.chat_count = this.props.appStore.chat_count + 1
            updates['/users/' + uid + '/chat_count'] = this.props.appStore.chat_count
            updates['/posts/' + newPostKey] = postData
            updates['/user_posts/' + uid + '/posts/' + newPostKey] = postData
            updates['/user_chats/' + uid + '/posts/' + newPostKey] = postData
            updates['/messages_notif/' + newPostKey + '/include_player_ids'] = [this.props.appStore.user.uid]
            firebaseRef.database().ref().update(updates)
            .then(() => {
              this.setState({
                              postStatus: 'Posted! Thank You.',
                              postTitle: '',
                              postPrice: '',
                              postText: '',
                              Author:'',
                              imagePath: null,
                              imageHeight: null,
                              imageWidth: null,
                              spinnervisible: false,
                            })
              setTimeout(() => {
                this.setState({ postStatus: null })
              }, 3000)
              setTimeout(() => {
                //this.refs.scrollContent.scrollToPosition(0, 0, true)
              }, 1000)
            })
            .catch(() => {
              this.setState({ postStatus: 'Something went wrong!!!' })
              this.setState({ spinnervisible: false })
            })
          })
          .catch(error => {
            console.log(error)
            this.setState({ spinnervisible: false })
          })

        } else {
          this.setState({ postStatus: 'Please enter an author' })
        }
      } else {
        this.setState({ postStatus: 'Please enter a title' })
      }
    } else {
      this.setState({ postStatus: 'Please take a photo' })
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    padding: 10,
    //flexDirection: 'column',
  },
  title: {
    marginTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    // fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    height: 160,
    //width: 300,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
  },
  titleContainer: {
    height: 40,
    //width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,.6)',
    marginBottom: 10,
    marginTop: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 2,
  },
  inputField: {
    flex: 1,
    width: 300,
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 13,
  },
  btnAdd: {
    width: 280,
    height: 40,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  postImage: {
    alignSelf: 'center',
    height: 140,
    width: 140,
    marginBottom: 10,
    backgroundColor: '#fff',
  }
})
