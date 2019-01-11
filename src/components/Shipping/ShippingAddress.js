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
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'

@inject("appStore") @observer
export default class ShippingAddress extends Component {

	constructor(props){
		super(props);
		this.state = {
			fullname: '',
			address: '',
			AptNo: '',
			city: '',
			state_us: '',
			zip: '',
			phone_number: '',
			errormessage_a: '',
			errormessage_b: '',
			errormessage_c: '',
			errormessage_d: '',
			errormessage_e: '',
			errormessage_f: '',
			errormessage_g: ''
		}
	}

	componentWillMount() {
	}

	render() {
		return (
			<View>
				<FormInput
					onChangeText={(text) => this.setState({fullname: text})}
					placeholder = "Full Name"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} 
					style={styles.input}/>
				<FormValidationMessage>{this.state.errormessage_a}</FormValidationMessage>

				<FormInput 
					onChangeText={(text) => this.setState({address: text})}
					placeholder = "Address"
					placeholderTextColor= 'grey'
					returnKeyType= "next"
					onSubmitEditing={(event) => { this.refs.AptNoInput.focus(); }}
					autoCorrect={false}
					value= {this.state.address}
					style={styles.input}
					ref='AddressInput'/>
				<FormValidationMessage>{this.state.errormessage_b}</FormValidationMessage>

				<FormInput 
					placeholder = "Apt, Unit, Building"
					placeholderTextColor= "grey"
					returnKeyType='next'
					onSubmitEditing={(event) => { this.refs.CityInput.focus(); }}
					autoCorrect={false}
					onChangeText={(text) => this.setState({AptNo: text})}
					value= {this.state.AptNo}
					style={styles.input}
					ref='AptNoInput'/>
				<FormValidationMessage>{this.state.errormessage_c}</FormValidationMessage>
				
				<FormInput 
					placeholder = "City"
					placeholderTextColor= "grey"
					returnKeyType= 'next'
					onChangeText={(text) => this.setState({city: text})}
					value= {this.state.city}
					autoCorrect={false}
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.StateInput.focus(); }} 
					ref= 'CityInput'/>
				<FormValidationMessage>{this.state.errormessage_d}</FormValidationMessage>
				
				<FormInput 
					placeholder = "State"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({state_us: text})}
					value= {this.state.state_us} 
					autoCorrect={false}
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.ZipInput.focus(); }}
					ref= 'StateInput'/>
				<FormValidationMessage>{this.state.errormessage_e}</FormValidationMessage>

				<FormInput 
					placeholder = "Zip"
					placeholderTextColor = "grey"
					returnKeyType = "next"
					onChangeText = {(text) => this.setState({zip: text})}
					value = {this.state.zip}
					autoCorrect={false}
					style={styles.input}
					onSubmitEditing={(event) => { this.refs.PhoneInput.focus(); }}
					ref= 'ZipInput' />
				<FormValidationMessage>{this.state.errormessage_f}</FormValidationMessage>
				
				<FormInput 
					placeholder = "Phone Number"
					placeholderTextColor= "grey"
					onChangeText={(text) => this.setState({phone_number: text})}
					value={this.state.phone_number}
					keyboardType= "tel"
					autoCorrect={false}
					style={styles.input}
					ref= 'PhoneInput'/>
				<FormValidationMessage>{this.state.errormessage_g}</FormValidationMessage>
				<Button
					// buttonStyle={}
					containerStyle={{marginTop: 32}}
					// containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
					activeOpacity={0.8}
					title={'Deliver to Address'}
					onPress={this._handleAddress}
					titleStyle={styles.loginTextButton}
					// loading={isLoading}
					// disabled={isLoading}
					raised={true}
					rounded
					/>
			</View>
		);
	}

	_handleAddress(){
		if (this.state.fullname !== null) {
			this.props.appStore.fullname = this.state.fullname
		} else {
			this.setState({errormessage_a: 'This field is required'})
		}

		if (this.state.address == null) {
			this.setState({errormessage_b: 'This field is required'})
		} else {
			this.props.appStore.address = this.state.address
		}
		
		if (this.state.AptNo !== null) {
			this.props.appStore.address = this.state.address
		} else {
			this.setState({errormessage_c: 'This field is required'})
		}

		if (this.state.city !== null){
			this.props.appStore.city = this.state.city
		} else {
			this.setState({errormessage_d: 'This field is required'})
		}

		if (this.state.state_us !== null) {
			this.props.appStore.state_us = this.state.state_us
		} else {
			this.setState({errormessage_e: 'This field is required'})
		}

		if (this.state.zip !== null) {
			this.props.appStore.zip = this.state.zip
		} else {
			this.setState({errormessage_f: 'This field is required'}) 
		}

		if (this.state.phone_number !== null) {
			this.props.appStore.phone_number =  this.state.phone_number
		} else {
			this.setState({errormessage_g: 'This field is required'})
		}
	}
}

const styles = StyleSheet.create ({

})