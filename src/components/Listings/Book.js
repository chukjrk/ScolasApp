/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Image, Dimensions, TouchableWithoutFeedback, AsyncStorage } from 'react-native';
import { View, Container, Content, Button, Left, Right, Icon, Picker, Item, Grid, Col, Toast, Text as NBText } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Carousel, { Pagination } from 'react-native-snap-carousel';

// Our custom files and classes import
import Text from '../component/Text';
import Navbar from '../component/Navbar';
import {default as ProductComponent} from '../component/Product';

import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import moment from 'moment';
import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'
import { SearchBar } from 'react-native-elements'
import base from "re-base";



@inject("appStore") @observer
export default class Book extends Component {

  constructor(props) {
    super(props);
    this.state = {
      product: {},
      activeSlide: 0,
      quantity: 1,
      // messages: [],
      postProps: {},
      status: ""
    };

    this.props.appStore.current_puid = this.props.puid
  }

  componentWillMount() {
    //get the product with id of this.props.product.id from your server
    this.setState({product: dummyProduct});
    console.log("---- CHAT WILL MOUNT ----- " + this.props.puid)
    firebaseRef.database().ref('posts').child(this.props.puid).once('value',
    (snapshot) => {
      //console.log(snapshot.val())
      // Actions.refresh({title: snapshot.val().title})
      this.setState({
                      status:snapshot.val().status,
                      clientName:snapshot.val().clientName,
                      postProps: snapshot.val(),
                    })
      if (snapshot.val().image) {
        this.setState((previousState) => {
          return {
            _id: 1,
            text: snapshot.val().title,
            createdAt: snapshot.val().createdAt,
            user: {
              _id: snapshot.val().uid,
              name: snapshot.val().username,
             },
            image: snapshot.val().image,
            ),
          }
        })
      }

      if (snapshot.val().text) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, {
              _id: 3,
              text: snapshot.val().text,
              // createdAt: new Date(snapshot.val().createdAt),
              user: {
                _id: snapshot.val().uid,
                name: snapshot.val().username,
              },
            }),
          }
        })
      }
    })
  }

  render() {
    return(
      <Container style={{backgroundColor: '#fdfdfd'}}>
        <Navbar left={left} right={right} title={this.props.postProps.title} />
        <Content>
          <Carousel
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
            />
          <View style={{backgroundColor: '#fdfdfd', paddingTop: 10, paddingBottom: 10, paddingLeft: 12, paddingRight: 12, alignItems: 'center'}}>
            <Grid>
              <Col size={3}>
                <Text style={{fontSize: 18}}>{this.state.postProps.title}</Text>
              </Col>
              <Col>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>{this.state.postProps.price}</Text>
              </Col>
            </Grid> 
            <Grid style={{marginTop: 15}}>
              <Col size={3}>
                <Button block onPress={this.addToCart.bind(this)} style={{backgroundColor: Colors.navbarBackgroundColor}}>
                  <Text style={{color: "#fdfdfd", marginLeft: 5}}>Add to cart</Text>
                </Button>
              </Col>
              <Col>
              <Button block onPress={this.addToWishlist.bind(this)} icon transparent style={{backgroundColor: '#fdfdfd'}}>
                <Icon style={{color: Colors.navbarBackgroundColor}} name='ios-heart' />
              </Button>
              </Col>
            </Grid>
            <View style={{marginTop: 15, padding: 10, borderWidth: 1, borderRadius: 3, borderColor: 'rgba(149, 165, 166, 0.3)'}}>
              <Text style={{marginBottom: 5}}>Description</Text>
              <View style={{width: 50, height: 1, backgroundColor: 'rgba(44, 62, 80, 0.5)', marginLeft: 7, marginBottom: 10}} />
              <NBText note>
                {this.state.postProps.description}
              </NBText>
            </View>
          </View>
        </Content>
      </Container>
    );
  }

  _openChat = (postData) => {
    console.log(" *************** Opening CHAT ROOM *************** " + postData.puid);
    Actions.chat({ title:postData.title, puid:postData.puid })
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
