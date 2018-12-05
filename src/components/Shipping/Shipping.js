import React, { Component } from 'react';
import {
	TouchableOpacity,
	View,
	Text,
	StyleSheet,
	ScrollView
} from 'react-native'
import { observer,inject } from 'mobx-react/native'
import { Button } from 'react-native-elements'

@inject("appStore") @observer
export default class Shipping extends Component {
	render() {
		return (
			<ScrollView style={styles.root}>
				<Button
					// buttonStyle={}
					containerStyle={{marginTop: 32}}
					// containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
					activeOpacity={0.8}
					title={'Ship Book'}
					onPress={this._handleShip}
					titleStyle={styles.loginTextButton}
					raised={true}
					/> 
				<View style={styles.container}>
					<Text> Shipping to: {this.props.appStore.fullname}
						{this.props.appStore.address} </Text>
					<Text> Book: </Text>
					<Text> Order Total: </Text>
				</View>
				
				<TouchableOpacity style={styles.container}>
						<Text> Shipping Address</Text>
						{/*<TouchableOpacity> this.props.appStore.fullname </TouchableOpacity>*/}
				</TouchableOpacity>
				<Text> Payment Information </Text>
				<View>
					<TouchableOpacity style={styles.container}> 
						<Text> Payment Method </Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.container}>
						<Text> Billing Address </Text>
					</TouchableOpacity>
				</View>
				<Button
					buttonStyle={styles.buttondeliver}
					containerStyle={{marginTop: 32}}
					containerViewStyle={{borderRadius: 25, color: 'green' }}
					activeOpacity={0.8}
					title={'Ship Book'}
					onPress={this._handleShip}
					titleStyle={styles.loginTextButton}
					raised={true}
					/>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create ({
	root: {
		flex: 1,
		paddingTop: 15,
		// backgroundColor: '#f0f0f0'
	},

	header: {
		// paddingTop: 25,
		// paddingBottom: 17,
	},

	container: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 15,
		margin: 10,
		marginBottom: 20,
		paddingTop: 15,
		paddingBottom:5,
		borderColor: '#f0f0f0',
		shadowColor: '#000',
		backgroundColor: '#fff',
		height: 100
	},
	buttondeliver: {
		// color: 'green',
		marginBottom: 45
	}
})
