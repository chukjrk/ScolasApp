import React, { Component } from 'react';
import {View, StyleSheet, AsyncStorage} from 'react-native';
import DatePicker from 'react-native-datepicker'
import { observer,inject } from 'mobx-react/native'

@inject("appStore") @observer
export default class Dob extends Component {
	constructor(props) {
		super(props);
		// this.state = {chosenDate: new Date()};
		this.state = {date: new Date()}

		this.setDate = this.setDate.bind(this);
	}

	setDate(newDate) {
		this.setState({chosenDate: newDate});
	}

	render() {
		const datenow = new Date();
		return (
			<DatePicker
		        style={{width: 200}}
		        date={this.state.date}
		        mode="date"
		        placeholder="select date"
		        format="YYYY-MM-DD"
		        minDate="2016-05-01"
		        maxDate= {datenow}
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
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
})
// 	render() {
// 		return (
// 			<View>
// 				<DatePickerAndroid
// 					          date={this.state.chosenDate}
// 					          onDateChange={this.setDate}
// 					        />
// 			</View>
// 		);
// 	}
// }