import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, KeyboardAvoidingView, WebView, Linking } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { observer,inject } from 'mobx-react/native'
import { firebaseRef } from '../../services/Firebase'

@inject("appStore") @observer
export default class PayoutInfo extends Component {
	static navigationOptions = {
	    headerTitleStyle: {
	      alignSelf: 'center',
	    },
	};

	constructor(props){
		super(props);
		this.state = {
			routing_number: '',
			account_number: '',
		}
	}

	_createacct(){
		const routing_number = this.state.routing_number;
		const acct_number = this.state.account_number;
		const firstname = this.props.appStore.firstname 
	    const lastname = this.props.appStore.lastname
	    // const line1 = this.state.line1;
	    // const city = this.state.city;
	    // const state_us = this.state.state_us;
	    // const postal_code = this.state.zip;
	    const ssn = this.props.appStore.ssn_last_4;
	    const phone = this.props.appStore.phone_number;
	    const dob_day = this.props.appStore.dob_day;
	    const dob_month = this.props.appStore.dob_month;
	    const dob_year = this.props.appStore.dob_year;

		const userId = firebaseRef.auth().currentUser.uid
		// .then((snapshot) => {
		// firebaseRef.database().ref('users/'+ userId '/stripe_accounts').set(user.uid)
		// .then(() => {
		firebaseRef.database().ref('/stripe_accounts/'+userId).set({
			firstname,
			lastname,
			// address: {
			// 	line1,
			// 	city,
			// 	state: state_us,
			// 	postal_code
			// },
			ssn_last_4: ssn,
			// email: userId.email,
			phone,
			dob_day,
			dob_month,
			dob_year,
			acct_number,
			routing_number,
		})
		// })
		// })
	}

	render() {
		const uri = 'http://stackoverflow.com/questions/35531679/react-native-open-links-in-browser';

		return (
			<KeyboardAvoidingView style={styles.root}>
				<Text style={styles.headerinfo}>Payout Information</Text>
				<FormInput
					placeholder = "Account Number"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({account_number: text})}
					value={this.state.account_number}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.RNInput.focus(); }} 
					style={styles.input}/>
				<FormInput
					placeholder = "Routing Number"
					placeholderTextColor= "grey"
					returnKeyType= "go"
					onChangeText={(text) => this.setState({account_number: text})}
					value={this.state.account_number}
					autoCorrect={false}
					style={styles.input}
					ref= 'RNInput'/>
				<TouchableOpacity style={styles.button} onPress={() => this._openCreate(), this._createacct()} >
					<Icon 
						name={'arrow-right'}
						// name={'chevron-right'}
						size={20} />
				</TouchableOpacity>
				<View style={{flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', textAlign: 'center'}}>
					<Text style={{fontSize: 12, textAlign: 'center'}}>By clicking, you agree to </Text>
					<Text style={{color: 'blue', fontSize: 12, textAlign: 'center'}} onPress={() => Linking.openURL('http://google.com')}>our terms</Text>
					<Text style={{fontSize: 12, textAlign: 'center'}}> and the </Text>
					<Text style={{color: 'blue',fontSize: 12, textAlign: 'center'}} onPress={() => Linking.openURL('https://stripe.com/us/connect-account/legal')}>
						Stripe Connected Account Agreement
					</Text>
					<Text style={{fontSize: 12}}>.</Text>
				</View>
			</KeyboardAvoidingView>
		);
	}

	_openCreate(){
	    this.props.navigation.navigate('Add');
	}
}

const styles = StyleSheet.create ({
	root: {
		// alignItems: 'center',
		justifyContent: 'center',
		margin:15
	},
	input: {
		fontSize: 16,
	},
	button: {
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
	headerinfo: {
		fontSize: 30,
		textAlign: 'left',
		marginVertical: 20
	}
})
