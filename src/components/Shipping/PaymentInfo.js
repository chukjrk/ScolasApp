// import React, { Component } from 'react';
// import { CreditCardInput } from "react-native-credit-card-input";
// import { UIManager, LayoutAnimation } from 'react-native'

import React, { Component } from "react";
import { StyleSheet, View, Switch, Text} from "react-native";
import { Button } from 'react-native-elements'
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";
// import { AppRegistry, StyleSheet,  } from 'react-native';

global.PaymentRequest = require('react-native-payments').PaymentRequest;
const ReactNativePaymentsVersion = require('react-native-payments/package.json')
.version;

export default class PaymentInfo extends Component {

	_onChange = (formData) => console.log(JSON.stringify(formData, null, " "));
	_onFocus = (field) => console.log("focusing", field);

	constructor() {
		super();

		this.state = {
			text: null
		};
	}

	handlePress() {
		const supportedMethods = [
		{
			supportedMethods: ['apple-pay'],
			data: {
				merchantIdentifier: 'merchant.com.react-native-payments.naoufal',
				supportedNetworks: ['visa', 'mastercard'],
				countryCode: 'US',
				currencyCode: 'USD',
				paymentMethodTokenizationParameters: {
					parameters: {
						gateway: 'stripe',
						'stripe:publishableKey': 'pk_test_eTrjMrHYblUkGZ8Fv4lA3nBq'
					}
				}
			}
		}
		];

		const details = {
			id: 'basic-example',
			displayItems: [
			{
				label: 'Movie Ticket',
				amount: { currency: 'USD', value: '15.00' }
			}
			],
			total: {
				label: 'Merchant Name',
				amount: { currency: 'USD', value: '15.00' }
			}
		};

		const pr = new PaymentRequest(supportedMethods, details);

		pr
		.show()
		.then(paymentResponse => {
			this.setState({
				text: paymentResponse.details.paymentToken
			});

			paymentResponse.complete('success');
		})
		.catch(e => {
			pr.abort();

			this.setState({
				text: e.message
			});
		});
	}

	state = {
		activeSections: [],
	};

	_renderSectionTitle = section => {
		return (
			<View style={s.content}>
			<Text>{section.content}</Text>
			</View>
		);
	};

	_renderHeader = section => {
		return (
			<View style={s.header}>
			<Text style={s.headerText}>Enter Card Information</Text>
			</View>
		);
	};

	_renderContent = section => {
		return (
			<View style={s.container}>
				<CreditCardInput
					autoFocus

					requiresName
					requiresCVC
					requiresPostalCode

					labelStyle={s.label}
					inputStyle={s.input}
					validColor={"black"}
					invalidColor={"red"}
					placeholderColor={"darkgray"}

					onFocus={this._onFocus}
					onChange={this._onChange} />
			</View>
		);
	};

	_updateSections = activeSections => {
		this.setState({ activeSections });
	};
	// <Accordion
				// sections={SECTIONS}
				// activeSections={this.state.activeSections}
				// renderSectionTitle={this._renderSectionTitle}
				// renderHeader={this._renderHeader}
				// renderContent={this._renderContent}
				// onChange={this._updateSections}
				// />
			// </View>

	render() {
		return (
			<View>
			<View style={s.container}>
				<CreditCardInput
					autoFocus

					requiresName
					requiresCVC
					requiresPostalCode

					labelStyle={s.label}
					inputStyle={s.input}
					validColor={"black"}
					invalidColor={"red"}
					placeholderColor={"darkgray"}

					onFocus={this._onFocus}
					onChange={this._onChange} />
			</View>
			<Button
			// buttonStyle={}
			containerStyle={{marginTop: 32}}
			// containerViewStyle={{borderRadius: 25, width: SCREEN_WIDTH - 50, alignSelf: 'center' }}
			activeOpacity={0.8}
			title={'Deliver to Address'}
			onPress={this.handlePress}
			// titleStyle={styles.loginTextButton}
			// loading={isLoading}
			// disabled={isLoading}
			raised={true}
			rounded
			/>
			</View>

		);
	}
}

const s = StyleSheet.create({
	container: {
		backgroundColor: "#F5F5F5",
		marginTop: 60,
	},
	label: {
		color: "black",
		fontSize: 12,
	},
	input: {
		fontSize: 16,
		color: "black",
	},
	container2: {
		flex: 1,
		marginTop: 25,
		padding: 10
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});