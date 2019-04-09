import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, KeyboardAvoidingView } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-datepicker'
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class PhoneNumber extends Component {
	static navigationOptions = {
	    headerTitleStyle: {
	      alignSelf: 'center',
	    },
	};

	constructor(props){
		super(props);
		this.state = {
			phonenumber: '',
			ssn: '',
			date: new Date()
		}
	}

	_submitinfo(){
		this.props.appStore.phone_number = this.state.phonenumber;
		this.props.appStore.ssn_last_4 = this.state.ssn;
		const fulldate = this.state.date
		const year = fulldate.substring(0,4);
		const month = fulldate.substring(5,7);
		const day = fulldate.substring(8,11);
		this.props.appStore.dob_year = year;
		this.props.appStore.dob_month = month;
		this.props.appStore.dob_day = day;
		console.log('This is date: ', this.state.date)
		console.log('This is how the date is formateed: ----------------------> ', day)
		console.log('This is how the date is formateed: ----------------------> ', month)
		console.log('This is how the date is formateed: ----------------------> ', year)
		this.props.navigation.navigate('PayoutInfo');
	}

	render() {
		const datenow = new Date();
		return (
			<KeyboardAvoidingView style={styles.root}>
				<Text style={styles.headerinfo}>This information will be used verify your identity</Text>
				<FormInput
					placeholder = "Phone Number"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({phonenumber: text})}
					value={this.state.phonenumber}
					autoCorrect={false}
					keyboardType='phone-pad'
					onSubmitEditing={(event) => { this.refs.SSNInput.focus(); }} 
					style={styles.input}
					maxLength= {10}/>
				<FormInput
					placeholder = "Enter last 4 of your SSN"
					placeholderTextColor= "grey"
					returnKeyType= "go"
					onChangeText={(text) => this.setState({ssn: text})}
					value={this.state.ssn}
					autoCorrect={false}
					keyboardType='numeric'
					style={styles.input}
					ref='SSNInput'
					maxLength= {4}
					secureTextEntry={true}/>
				<View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
				<Text style={{fontSize: 16, alignSelf: 'center'}}>Date of birth:</Text>
				<DatePicker
			        style={{width: 200, alignSelf: 'center'}}
			        date={this.state.date}
			        mode="date"
			        // placeholder="Select Date of Birth"
			        format="YYYY-MM-DD"
			        androidMode= 'spinner'
			        // minDate="2016-05-01"
			        maxDate= {datenow}
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
			        onDateChange={(date) => {this.setState({date: date})}}
			    />
			    </View>
			    <TouchableOpacity style={styles.button} onPress={() => this._submitinfo()}>
					<Icon 
						name={'arrow-right'}
						// name={'chevron-right'}
						size={20} />
				</TouchableOpacity>
			</KeyboardAvoidingView>
		);
	}
}
const styles = StyleSheet.create ({
	root: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		// margin:15
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
		margin: 20
	},
	input: {
		fontSize: 16,
		width: 250,
		justifyContent: 'space-between'
	},
	headerinfo: {
		fontSize: 25,
		textAlign: 'center',
		marginVertical: 20
	}
})