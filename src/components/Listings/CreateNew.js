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
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import { firebaseRef } from '../../services/Firebase';
import firebase from 'firebase';
import { observer,inject } from 'mobx-react/native';
import { navigationOptions } from 'react-navigation';
import StickyHeaderFooterScrollView from 'react-native-sticky-header-footer-scroll-view'
import { Header, Button } from 'react-native-elements'
import OneSignal from 'react-native-onesignal'
import Icon from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-datepicker'
import Carousel from 'react-native-snap-carousel';
import SliderEntry from './SliderEntry';
import { sliderWidth, itemWidth } from '../../styles/SliderEntry.style';

const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const screenWidth = Dimensions.get('window').width

// const uploadImage = (uri, imageName, mime = 'image/jpg') => {
const uploadImage = (uri, newPostKey, mime = 'image/jpg') => {
  let urlArray = []
  let uploadBlob = null
  let photos = uri.map(img => img);
  console.log('Is it real', photos)
  return new Promise ((resolve,reject) => {
    // imageName being the same seems to be the problem re add the promise with resolve and reject
    // ***************************************************
    photos.forEach((image, i) => {
      const imageAfa = `${newPostKey}`+`${i}.jpg` 
      const imageRef = firebaseRef.storage().ref('posts').child(imageAfa)
      const uploadUri = Platform.OS === 'ios' ? image.replace('file://', '') : image

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
        // another[i] = url
        // urlArray.push(url)
        resolve(url)
        console.log('URL')
        console.log(url)
        urlArray.push(url)
        console.info(':::::::::::::: The Array :::::::::::')
        console.info(urlArray)
        firebaseRef.database().ref('/posts/' + newPostKey).update({
          image: urlArray
        })
        firebaseRef.database().ref('/user_posts/' + uid + '/posts/' + newPostKey).update({
          image: urlArray
        })
        firebaseRef.database().ref('/user_chats/' + uid + '/posts/' + newPostKey).update({
          image: urlArray
        })
        // console.log('make it clapp', another)
      })
      .catch((error) => {
        reject(error)
      })
    })
  })
}

const fullyear = new Date().getFullYear().toString();
const fullmonth = new Date().getMonth().toString();
const fullday = new Date().getDate().toString();
console.log('                                                      ', fullday, fullmonth, fullyear)

@inject("appStore") @observer
export default class CreateNew extends Component {
	constructor(props){
		super(props)
		this.state = {
			postStatus: null,
			postText: '',
			postTitle: '',
			Author: '',
      rentalPrice: 0,
      rentalPeriod_1: fullday + '-' + fullmonth + '-' + fullyear,
      rentalPeriod_2: '',
      rentalPeriod: '',
      allimages: [],
 			imagePath: {},
			imageHeight: [],
			imageWidth: [],
      imageExists: false,
      displaybool: true,
		}
	}

  componentWillMount() {
    OneSignal.init("YOUR_ONESIGNAL_APPID");
    OneSignal.configure(); //will trigger ids event to fire.
    OneSignal.addEventListener('ids', this.onIds);
    user_id = firebaseRef.auth().currentUser.uid;
    firebaseRef.database().ref(`users/${user_id}`).once('value')
    .then((snapshot) => {
      this.setState({displaybool: snapshot.val().seller_account})
    })
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('ids', this.onIds); 
  }

  onIds(device) {
    console.log('Device info: ', device); //your playerId
  }

  _renderItem ({item, index}) {
    return <SliderEntry data={item} even={(index + 1) % 2 === 0} />;
  }

	render() {
    const datenow = new Date();
    const height = ((screenWidth-40)*this.state.imageHeight/this.state.imageWidth)
    const photo = this.state.imageExists ?
      <Carousel
        data={this.state.imagePath}
        renderItem={this._renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        // itemHeight={height}
        layout={'stack'}
        layoutCardOffset={18}
        loop={true}
        />
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

    // const photo = this.state.imagePath ?
    //   <View style={{ flex:1, }}>
    //     <Image
    //       source={{ uri:this.state.imagePath }}
    //       resizeMode='contain'
    //       style={{
    //         height: height,
    //         width: screenWidth-40,
    //         alignSelf: 'center',
    //         marginBottom: 10,
    //       }}
    //     />
    //   </View>
    //  :
    //    <View style={{ flex:1, marginBottom: 10,}}>
    //      <Image
    //       style={{
    //         height: 100,
    //         width: 100,
    //         backgroundColor:'#4285f4',
    //         alignSelf: 'center',
    //         borderRadius: 5,
    //       }}
    //      />
    //    </View>
       
    const AddNewDisplay =
      <ScrollView showsVerticalScrollIndicator={false} ref='scrollContent'>
        <RkText style={styles.title}>{'PICTURE'}</RkText>
        { photo }
        <TouchableOpacity style={styles.imagebutton} onPress={() => this._takePicture()}>
          <Icon 
            name={'plus'}
            color='rgba(39, 146, 74, 0.8)'
            size={20} />
        </TouchableOpacity>            
        <RkText style={styles.message}>{this.state.postStatus}</RkText>
        <View style={styles.titleContainer}>
          <TextInput
          style={styles.inputField}
          value={this.state.postTitle}
          onChangeText={(text) => this.setState({ postTitle: text })}
          underlineColorAndroid='transparent'
          placeholder='Title'
          // placeholderTextColor='rgba(0,0,0,.6)'
          placeholderTextColor='black'
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
          // placeholderTextColor='rgba(0,0,0,.6)'
          placeholderTextColor='black'
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
          returnKeyType= "next"
          onChangeText={(text) => this.setState({ postText: text })}
          // placeholderTextColor='rgba(0,0,0,.6)'
          placeholderTextColor='black'
          />
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 5, paddingHorizontal: 15}}>
          <Text style={{fontSize: 16, alignSelf: 'flex-start', color: 'black'}}>Rental Price: </Text>
          <TextInput
          ref='FourthInput'
          style={styles.priceInputField}
          underlineColorAndroid='transparent'
          placeholder='$'
          // value={this.state.rentalPrice}
          onChangeText={(text) => this.setState({ rentalPrice: text })}
          // placeholderTextColor='rgba(0,0,0,.6)'
          placeholderTextColor='black'
          keyboardType='numeric'
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingBottom: 15}} >
          <Text style={{fontSize: 16, color: 'black', alignSelf: 'flex-start'}}>Return Date: </Text>
          <DatePicker
            style={{width: 200, alignSelf: 'flex-end'}}
            date={this.state.date}
            mode="date"
            format="DD-MM-YYYY"
            minDate={datenow}
            showIcon= {false}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0
              },
              dateInput: {
                marginLeft: 36
              }
              // ... You can check the source to find the other keys.
            }}
            onDateChange={(date) => {this.setState({rentalPeriod_2: date})}}
          />
        </View>
        <Button
          raised
          icon={{name: 'send'}}
          onPress={this._handleNewPost}
          title= 'POST'
          backgroundColor= '#25a1e0'
          fontWeight= '800' />
      </ScrollView>
    const ButtonDisplay = 
      <View style={{justifyContent: 'center', flex: 1}}>
        <Text style={{fontSize: 30, textAlign: 'center'}}>To rent out books you need to create a seller's account</Text>
        <TouchableOpacity style={styles.buttons} onPress={() => this._openSellerAcct()} >
        <Icon 
          name={'arrow-right'}
          // name={'chevron-right'}
          size={20} />
      </TouchableOpacity>
      </View>

    let displaypresent 
    if (this.state.displaybool) {
      displaypresent = AddNewDisplay
    } else {
      displaypresent = ButtonDisplay
    }

    return (
      <View style={styles.container}>{displaypresent}</View>
    )
  }


  _openSellerAcct(){
    this.props.navigation.navigate('PersonalInfo');
  }

  _takePicture = () => {
    const cam_options = {
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      quality: 1,
      noData: true,
    };
    // ImagePicker.showImagePicker(cam_options, (response) => {
    //   if (response.didCancel) {
    //   }
    //   else if (response.error) {
    //     console.log(error.message)
    //   }
    //   else {
    //     this.setState({
    //       imagePath: response.uri,
    //       imageHeight: response.height,
    //       imageWidth: response.width,
    //     })
    //   }
    // })

    ImagePicker.openPicker({
      multiple: true
    }).then(images => {
      var arrPath = images.map((item, i) => images[i].path);
      var arrHeight = images.map((item, i) => images[i].height);
      var arrWidth = images.map((item, i) => images[i].width);
      var arr = images.map((item, i) => images[i])
      this.setState({
        imagePath: arrPath,
        imageHeight: arrHeight,
        imageWidth: arrWidth,
        // allimages: arr
      })

      this.setState({imageExists: true})
    })
  }

  _handleNewPost = () => {
    this.setState({
      postStatus: 'Posting...',
    }) 
    if (this.state.imagePath) {
      if (this.state.postTitle.length > 0) {
        if (this.state.Author.length > 0) {
          // if (this.state.rentalPrice.length > 0){
          this.setState({ spinnervisible: true })
          const uid = this.props.appStore.user.uid
          const username = this.props.appStore.user.displayName
          const newPostKey = firebaseRef.database().ref('posts').push().key
          const imageName = `${newPostKey}.jpg`
          var urlArray = []
          // for(let i = 0; i < this.state.imagePath.length; i++){
          uploadImage(this.state.imagePath, newPostKey)
          .then(url => {
            console.info(':::::::::::::: The Array :::::::::::')
            console.info(url)
          })
          .catch(error => {
            console.warn('this here is erong', error)
            this.setState({ spinnervisible: false })
          })
          // }
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
            Author: this.state.Author,
            price: this.state.rentalPrice,
            period: this.state.rentalPeriod_1 + ' - ' + this.state.rentalPeriod_2,
            puid: newPostKey,
            imageHeight: this.state.imageHeight,
            imageWidth: this.state.imageWidth,
          }
          let updates = {}
          // *********************************************************************************************************
          // Promotion for getting new users by offering them one point for posting their book on there
          // *********************************************************************************************************
          // this.props.appStore.user_point= this.props.appStore.user_point + 1
          // updates['/users/' + uid + '/user_point'] = this.props.appStore.user_point
          // *********************************************************************************************************
          this.props.appStore.post_count = this.props.appStore.post_count + 1
          updates['/users/' + uid + '/post_count'] = this.props.appStore.post_count
          this.props.appStore.chat_count = this.props.appStore.chat_count + 1
          updates['/users/' + uid + '/chat_count'] = this.props.appStore.chat_count
          updates['/posts/' + newPostKey] = postData
          updates['/user_posts/' + uid + '/posts/' + newPostKey] = postData
          updates['/user_chats/' + uid + '/posts/' + newPostKey] = postData
          updates['/messages_notif/' + newPostKey + '/include_player_ids'] = [this.props.appStore.user.uid]
          updates['/messages_notif/' + newPostKey + '/postData'] = postData
          firebaseRef.database().ref().update(updates)
          .then(() => {
            this.setState({
              postStatus: 'Posted! Thank You.',
              postTitle: '',
              postText: '',
              Author:'',
              rentalPrice: 0,
              rentalPeriod: '',
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
          // } else {
          //   this.setState({ postStatus: 'Please enter a price'})
          // }
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
    backgroundColor: 'white'
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
    // borderColor: '#e2e2e2',
    borderColor: 'grey',
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
    // borderColor: '#e2e2e2',
    borderColor: 'grey',
    borderRadius: 2,
  },
  inputField: {
    flex: 1,
    width: 300,
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 15,
    borderColor: 'black'
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
  },
  buttons: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 100,
    width: 70,
    height: 70,
    borderColor: 'grey',
    margin: 10
  },
  priceInputField: {
    width: 75,
    height: 40,
    borderRadius: 3,
    borderColor: 'grey',
    borderWidth: 1,
    fontSize: 15,
    alignSelf: 'flex-end'
  },
  imagebutton: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 100,
    width: 50,
    height: 50,
    borderColor: 'rgba(39, 146, 74, 0.85)',
    margin: 10
  },
})