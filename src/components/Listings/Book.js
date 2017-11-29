/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { View, Container, Content, Button, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
// import Carousel, { Pagination } from 'react-native-snap-carousel';
import _ from 'lodash';
import moment from 'moment';
import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'
import { SearchBar } from 'react-native-elements'
// import base from "re-base";

import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
  Alert,
  TouchableWithoutFeedback, 
  AsyncStorage
} from 'react-native'


const screenWidth = Dimensions.get('window').width

@inject("appStore") @observer
export default class Book extends Component {

  constructor(props) {
    super(props);
    this.state = {
      product: {},
      activeSlide: 0,
      quantity: 1,
      postProps: {},
      status: ""
    };

    this.props.appStore.current_page = 'book'
    this.props.appStore.current_puid = this.props.navigation.state.params.puid
  }

  componentWillMount() {
    //get the product with id of this.props.product.id from your server
    // this.setState({product: dummyProduct});
    console.log("---- CHAT WILL MOUNT ----- " + this.props.navigation.state.params.puid)
    firebaseRef.database().ref('posts').child(this.props.navigation.state.params.puid).once('value',
    (snapshot) => {
      //console.log(snapshot.val())
      // Actions.refresh({title: snapshot.val().title})
      this.setState({
                      status:snapshot.val().status,
                      clientName:snapshot.val().clientName,
                      postProps: snapshot.val(),
                    })
      if (snapshot.val().image) {
        this.setState({
          product: {
            _id: 1,
            title: snapshot.val().title,
            description: snapshot.val().text,
            createdAt: snapshot.val().createdAt,
            user: {
              _id: snapshot.val().uid,
              name: snapshot.val().username,
            },
            image: snapshot.val().image,
          }
        })
      }
    })
  }

  render(data) {
    // const height = screenWidth*data.imageHeight/data.imageWidth
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        <Content>
          <Image
            source={{ uri:this.state.postProps.image }}
            resizeMode='contain'
            style={{
              height: 480,
              width: screenWidth,
              alignSelf: 'center',
              paddingTop: 5,
            }}
          />
          {/*<Carousel
              ref={(carousel) => { this._carousel = carousel; }}
              sliderWidth={Dimensions.get('window').width}
              itemWidth={Dimensions.get('window').width}
              onSnapToItem={(index) => this.setState({ activeSlide: index }) }
              enableSnap={true}
            >
                {this.renderImages()}
            </Carousel>
            <Pagination
              dotsLength={this.state.postProps.images.length}
              activeDotIndex={this.state.activeSlide}
              containerStyle={{ backgroundColor: 'transparent',paddingTop: 0, paddingBottom: 0, marginTop: -15 }}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)'
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />*/}
          <View style={{backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center'}}>
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 18, alignSelf: 'center', fontWeight: 'bold'}}>{this.state.postProps.title}</Text>
              </Col>
            </Grid> 
            <Grid>
              <Col>
                <Text style={{fontSize: 18, fontStyle: 'italic'}}> - {this.state.postProps.Author}</Text>
              </Col>
            </Grid>
            
            <View style={{marginTop: 15, padding: 10, borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}>
              <Text style={{marginBottom: 5}}>Description</Text>
              <View style={{width: 50, height: 1, backgroundColor: 'rgba(44, 62, 80, 0.5)', marginLeft: 7, marginBottom: 10}} />
              <NBText note>
                {this.state.postProps.text}
              </NBText>
            </View>

            <Grid style={{marginTop: 15}}>
              <Col size={3}>
                <Button block onPress={() => this._BuyNow(data)}>
                  <Text style={{color: "#fdfdfd", marginLeft: 5}}>CONTACT SELLER</Text>
                </Button>
              </Col>
            </Grid>

          </View>
        </Content>
      </Container>
    );
  }

  _BuyNow = () => {
    if (this.props.appStore.user.uid == this.state.postProps.uid) {
      seller_id = this.props.appStore.user.uid
    } else {
      buyer_id = this.props.appStore.user.uid
      this.props.navigation.navigate('Chat',{ title:this.state.postProps.title, puid:this.state.postProps.puid, uid:this.props.appStore.user.uid , wantToBuy:true });
    }
  }

  renderImages() {
    let images = [];
    this.state.postProps.image.map((img, i) => {
      images.push(
          <TouchableWithoutFeedback
            key={i}
            onPress={() => this.openGallery(i)}
          >
            <Image
              source={{uri: img}}
              style={{width: Dimensions.get('window').width, height: 350}}
              resizeMode="cover"
            />
          </TouchableWithoutFeedback>
      );
    });
    return images;
  }

  openGallery(pos) {
    Actions.imageGallery({images: this.state.product.images, position: pos});
  }

//******
// Other books connected to that book *************************************************
//******

  // renderSimilairs() {
  //   let items = [];
  //   let stateItems = this.state.product.similarItems;
  //   for(var i=0; i<stateItems.length; i+=2 ) {
  //     if(stateItems[i+1]) {
  //       items.push(
  //         <Grid key={i}>
  //           <ProductComponent key={stateItems[i].id} product={stateItems[i]} />
  //           <ProductComponent key={stateItems[i+1].id} product={stateItems[i+1]} isRight />
  //         </Grid>
  //       );
  //     }
  //     else {
  //       items.push(
  //         <Grid key={i}>
  //           <ProductComponent key={stateItems[i].id} product={stateItems[i]} />
  //           <Col key={i+1} />
  //         </Grid>
  //       );
  //     }
  //   }
  //   return items;
  // }

  


//******
// Make the Watchlist notification idea
//******


  // addToWishlist() {
  //   var product = this.state.product;
  //   var success = true;
  //   AsyncStorage.getItem("WISHLIST", (err, res) => {
  //     if(!res) AsyncStorage.setItem("WISHLIST",JSON.stringify([product]));
  //     else {
  //       var items = JSON.parse(res);
  //       if(this.search(items, product)) {
  //         success = false
  //       }
  //       else {
  //         items.push(product);
  //         AsyncStorage.setItem("WISHLIST",JSON.stringify(items));
  //       }
  //     }
  //     if(success) {
  //       Toast.show({
  //         text: 'Product added to your wishlist !',
  //         position: 'bottom',
  //         type: 'success',
  //         buttonText: 'Dismiss',
  //         duration: 3000
  //       });
  //     }
  //     else {
  //       Toast.show({
  //         text: 'This product already exist in your wishlist !',
  //         position: 'bottom',
  //         type: 'danger',
  //         buttonText: 'Dismiss',
  //         duration: 3000
  //       });
  //     }
  //   });
  // }

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
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    padding: 5,
    color: '#444',
  },
  postImage: {
    backgroundColor: '#eee',
  },
  postInfo: {
    padding: 3,
    alignItems: 'center',
  },
  postButtons: {
    padding: 5,
    flexDirection: 'row',
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
  },
  info: {
    fontSize: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
})
