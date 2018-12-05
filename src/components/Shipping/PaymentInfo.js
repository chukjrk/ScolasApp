import React, { Component } from 'react';
import { CreditCardInput } from "react-native-credit-card-input";
import { UIManager, LayoutAnimation } from 'react-native'

export default class PaymentInfo extends Component {
	_onChange => form => console.log(form);

	render() {
		return (
			<CreditCardInput 
			onChange={this._onChange}
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
			// UIManager.setLayoutAnimationEnabledExperimental(true);
			 />
		);
	}
}
