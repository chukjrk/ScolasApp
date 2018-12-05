import React, { Component } from 'react';
import { View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	AsyncStorage,
	KeyboardAvoidingView,
	ImageBackground,
	Dimensions,
	LayoutAnimation,
	UIManager,
 	Image,
  	Alert
} from 'react-native';
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class ShippingForm extends Component {

	constructor(props){
		super(props);
		this.state {
			fullname: '',
			address: '',
			AptNo: '',
			city: '',
			state_us: '',
			zip: '',
			phone_number: ''
		}
	}

	componentWillMount() {
	}

	render() {
		return (
			<View>
				<TextInput
					placeholder = "Full Name"
					placeholderTextColor= "black"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} />
				<TextInput
					placeholder = "Address"
					placeholderTextColor= 'black'
					returnKeyType= "next"
					onSubmitEditing={(event) => { this.refs.AptNNInput.focus(); }}
					autoCorrect={false}
					underlineColorAndroid= "transparent"
					onChangeText={(text) => this.setState({address: text})}
					value= {this.state.address}
					style={styles.input}
					ref='AddressInput'/>
				<TextInput
					placeholder = "Apt, Unit, Building"
					placeholderTextColor= "black"
					returnKeyType='next'
					onSubmitEditing={(event) => { this.refs.CityInput.focus(); }}
					underlineColorAndroid= "transparent"
					onChangeText={(text) => this.setState({AptNo: text})}
					value= {this.state.AptNo}
					style={styles.input}
					ref='AptNoInput'/>
				<TextInput
					placeholder = "City"
					placeholderTextColor= "black"
					returnKeyType= 'next'
					onChangeText={(text) => this.setState({city: text})}
					value= {this.state.city}
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.StateInput.focus(); }} 
					ref= 'CityInput'/>
				<TextInput
					placeholder = "State"
					placeholderTextColor= "black"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({state_us: text})}
					value= {this.state.state_us} 
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.ZipInput.focus(); }}
					ref= 'StateInput' />
				<TextInput
					placeholder = "Zip"
					placeholderTextColor = "black"
					returnKeyType = "next"
					onChangeText = {(text) => this.setState({zip: text})}
					value = {this.state.zip}
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.PhoneInput.focus(); }}
					ref= 'ZipInput' />
				<TextInput
					placeholder = "Phone Number"
					placeholderTextColor= "black"
					onChangeText={(text) => this.setState({phone_number: text})}
					value={this.state.phone_number}
					keyboardType= "tel"
					autoCorrect={false}
					underlineColorsAndroid= "transparent"
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.PhoneInput.focus(); }} />
				<Button
					buttonStyle={}
					containerStyle={{marginTop: 32}}
					// containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
					activeOpacity={0.8}
					title={'Deliver to Address'}
					onPress={this._handleShip}
					titleStyle={styles.loginTextButton}
					loading={isLoading}
					disabled={isLoading}
					raised={true}
					rounded
					/>  
			</View>
		);
	}

	_handleShip(){
		this.props.appStore.fullname = this.state.fullname
		this.props.appStore.address = this.state.address
		this.props.appStore.city = this.state.city
		this.props.appStore.state_us = this.state.state_us
		this.props.appStore.zip = this.state.zip
		this.props.appStore.phone_number =  this.state.phone_number
	}
}
