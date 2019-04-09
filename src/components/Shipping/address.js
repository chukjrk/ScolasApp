import React, { Component } from 'react';
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class address extends Component {
	construction(props){
		super(props);
		this.state = {
			line1: '',
			line2: '',
			postal_code: '',
			city: '',
			stateus: '',
		}
	}

	submitinfo(){
		this.props.appStore.firstname = this.state.firstname;
		this.props.appStore.lastname = this.state.lastname;
		this.props.appStore.lastname = this.state.email;
	}

	render() {
		return (
			<View>
				<FormInput
					placeholder = "Address 1"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} 
					style={styles.input}
					ref='Email'/>
				<FormInput
					placeholder = "Address 2"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} 
					style={styles.input}
					ref='Email'/>
				<FormInput
					placeholder = "City"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} 
					style={styles.input}
					ref='Email'/>
				<FormInput
					placeholder = "State"
					placeholderTextColor= "grey"
					returnKeyType= "next"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					onSubmitEditing={(event) => { this.refs.AddressInput.focus(); }} 
					style={styles.input}
					ref='Email'/>
				<FormInput
					placeholder = "Postal Code"
					placeholderTextColor= "grey"
					onChangeText={(text) => this.setState({fullname: text})}
					value={this.state.fullname}
					autoCorrect={false}
					keyboardtype='numeric'
					style={styles.input}
					ref='Email'/>
				<Button />
			</View>
		);
	}
}

const styles = StyleSheet.create ({
	root: {

	},
	input: {

	}

})