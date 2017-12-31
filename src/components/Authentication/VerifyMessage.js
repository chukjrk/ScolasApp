import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'

export default class CheckVerification extends Component {
	render() {
		const { navigate } = this.props.navigation;

		return (
			<TouchableWithoutFeedback onPress={() => navigate('Login')} >
			<View style={styles.container} >
				
				<Text style={styles.info}> Verification email has been sent.
				Please verify your email then login!
				</Text>
				
			</View>
			</TouchableWithoutFeedback>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'rgb(51,204,102)',
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},

	info: {
		textAlign: 'center',
		fontSize: 18,
		color: 'white'
	}
});
