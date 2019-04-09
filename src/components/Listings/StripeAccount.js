import React, { Component } from 'react';
import stripe from 'tipsi-stripe';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, Platform, Share, KeyboardAvoidingView ,DatePickerAndroid } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form';
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import { Thumbnail, List, ListItem, Separator } from 'native-base';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';

stripe.setOptions({
  publishableKey: 'pk_test_Kt0xEhtPWyoHgMUjKsphNXKh',
  androidPayMode: 'test', // change for "production"
});

export default class StripeAccount extends Component {
	constructor(props){
		super(props);
		this.state = {
			firstname: '',
			lastname: '',
			line1: '',
			line2: '',
			city: '',
			state_us: '',
			zip: '',
			phone: '',
			dob: {
				day: '',
				month: '',
				year: '',
			},
			chosenDate: new Date()
		}
		this.setDate = this.setDate.bind(this);
	}

	setDate(newDate) {
    this.setState({chosenDate: newDate});
  }
  
	_createacct(){
		const firstname = this.state.firstname;
    const lastname = this.state.lastname;
    const line1 = this.state.line1;
    const city = this.state.city;
    const state_us = this.state.state_us;
    const postal_code = this.state.zip;
    const ssn = this.state.ssn;
    const phone = this.state.phone
    const dob_day = this.state.dob.day;
    const dob_month = this.state.dob.month;
    const dob_year = this.state.dob.year;
    const acct_number = this.state.acct_number;
    const routing_number = this.state.routing;

		firebaseRef.auth().currentUser.once('value')
		.then((snapshot) => {
			firebaseRef.database().ref('stripe_accounts').set(user.uid)
			.then(() => {
				firebaseRef.database.ref('/stripe_accounts/{userId}/accounts').set({
					firstname,
					lastname,
					address: {
						line1,
						city,
						state: state_us,
						postal_code
					},
					ssn_last_4: ssn,
					email: user.email,
					phone,
					dob_day,
					dob_month,
					dob_year,
					acct_number,
					routing_number,
					bank
				})
			})
		})
	}

	render() {
		return (
			<GiftedForm
    		formName='signupForm' // GiftedForm instances that use the same name will also share the same states
    		openModal={(route) => {
    			navigator.push(route); // The ModalWidget will be opened using this method. Tested with ExNavigator
    		}}
    		clearOnClose={false} // delete the values of the form when unmounted
    		defaults={{
					/*
					username: 'Farid',
					'gender{M}': true,
					password: 'abcdefg',
					country: 'FR',
					birthday: new Date(((new Date()).getFullYear() - 18)+''),
					*/
				}}
				validators={{
					fullName: {
						title: 'Full name',
						validate: [{
							validator: 'isLength',
							arguments: [1, 23],
							message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
						}]
					},
					username: {
						title: 'Username',
						validate: [{
							validator: 'isLength',
							arguments: [3, 16],
							message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
						},{
							validator: 'matches',
							arguments: /^[a-zA-Z0-9]*$/,
							message: '{TITLE} can contains only alphanumeric characters'
						}]
					},
					password: {
						title: 'Password',
						validate: [{
							validator: 'isLength',
							arguments: [6, 16],
							message: '{TITLE} must be between {ARGS[0]} and {ARGS[1]} characters'
						}]
					},
					emailAddress: {
						title: 'Email address',
						validate: [{
							validator: 'isLength',
							arguments: [6, 255],
						},{
							validator: 'isEmail',
						}]
					},				
				}}>
    
	    <GiftedForm.SeparatorWidget />

	    <GiftedForm.TextInputWidget
	      name='firstname' // mandatory
	      title='First name'
	      image={require('../../assets/icons/color/user.png')}
	      placeholder='First Name'
	      clearButtonMode='while-editing'
	    />
	    <GiftedForm.TextInputWidget
	      name='lastname' // mandatory
	      title='Last name'
	      image={require('../../assets/icons/color/user.png')}
	      placeholder='Last Name'
	      clearButtonMode='while-editing'
	    />
      <GiftedForm.TextInputWidget
        name='SSN' // mandatory
        title='SSN'
        placeholder='****'
        clearButtonMode='while-editing'
        keyboardType='numeric'
        secureTextEntry={true}
        placeholder='Enter last 4 digits of your SSN'
        image={require('../../assets/icons/color/lock.png')}
      />
      <GiftedForm.TextInputWidget
        name='emailAddress' // mandatory
        title='Email address'
        placeholder='example@email.com'
        keyboardType='email-address'
        clearButtonMode='while-editing'
        image={require('../../assets/icons/color/email.png')}
      />
      <GiftedForm.TextInputWidget
        name='phone'
        title='Phone Number'
        placeholder='Phone Number'
        image={require('../../assets/icons/color/contact_card.png')}
        clearButtonMode='while-editing'
        keyboardType='phone-pad'
      />
      <GiftedForm.ErrorsWidget/>

        <View>
	        <Collapse>
		        <CollapseHeader>
		        	<Separator bordered>
				        <Text>Address</Text>
				      </Separator>
				    </CollapseHeader>
		        <CollapseBody>
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
							<FormInput 
								placeholder = "Apt, Unit, Building"4
								placeholderTextColor= "grey"
								returnKeyType='next'
								onSubmitEditing={(event) => { this.refs.CityInput.focus(); }}
								autoCorrect={false}
								onChangeText={(text) => this.setState({AptNo: text})}
								value= {this.state.AptNo}
								style={styles.input}
								ref='AptNoInput'/>
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
		        </CollapseBody>
				  </Collapse>
				  <Collapse>
		        <CollapseHeader>
		        	<Separator bordered>
		        		<Text>Date of Birth</Text>
		        	</Separator>
		        </CollapseHeader>
		        <CollapseBody>
			        <DatePickerAndroid
			          date={this.state.chosenDate}
			          onDateChange={this.setDate}
			        />
		        </CollapseBody>
	        </Collapse>
	        <Collapse>
		        <CollapseHeader>
		        	<Separator bordered>
		        		<Text>Bank Account</Text>
		        	</Separator>
		        </CollapseHeader>
		        <CollapseBody>
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
		        </CollapseBody>
	        </Collapse>
        </View>

        <GiftedForm.NoticeWidget
          title='By signing up, you agree to the Terms of Service and Privacy Policity.'
        />

        <GiftedForm.HiddenWidget name='tos' value={true} />
      </GiftedForm>
		);
	}
}

const styles = StyleSheet.create ({

})
