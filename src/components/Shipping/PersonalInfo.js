import React, { Component } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, TextInput, Text, KeyboardAvoidingView } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class PersonalInfo extends Component {
	static navigationOptions = {
	    headerTitleStyle: {
	      alignSelf: 'center',
	    },
	};
	constructor(props){
		super(props);
		this.state = {
			firstname: '',
			lastname: '',
			email: '',
		}
		this._submitinfo = this._submitinfo.bind(this);
	}


	_submitinfo(){
		this.props.appStore.firstname = this.state.firstname;
		this.props.appStore.lastname = this.state.lastname;
		this.props.appStore.email = this.state.email;
		console.log('appStore creation message: =================>', this.props.appStore.firstname)
		console.log('appStore creation message: =================>', this.props.appStore.lastname)
		console.log('appStore creation message: =================>', this.props.appStore.email)
		this.props.navigation.navigate('PhoneNumber');
	}

	render() {
		return (
			<KeyboardAvoidingView>
				<Text style={{fontSize: 40, marginVertical: 10, textAlign: 'center'}}>Create a sellers account</Text>
				<FormInput
					placeholder = "First Name"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({firstname: text})}
					value={this.state.firstname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.LastNameInput.focus(); }} 
					style={styles.input}/>
				<FormInput
					placeholder = "Last Name"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({lastname: text})}
					value={this.state.lastname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.EmailInput.focus(); }} 
					style={styles.input}
					refs='LastNameInput'/>
				<FormInput
					placeholder = "Email"
					placeholderTextColor= "grey"
					returnKeyType= "go"
					onChangeText={(text) => this.setState({email: text})}
					value={this.state.email}
					autoCorrect={false}
					keyboardType='email-address'
					style={styles.input}
					ref='EmailInput'/>
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

})