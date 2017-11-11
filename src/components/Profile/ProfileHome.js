import React, { Component } from 'react';
import { Stylesheet, Text } from 'react-native';
import { RkButton, RkText } from 'react-native-ui-kitten';
import { Router, Scene } from 'react-native-router-flux';
import CreateNew from '../Listings/CreateNew';
import Login from '../Authentication/Login';
import Register from '../Authentication/Register';

const TabIcon = ({ selected, title }) => {
	return (
		<Text style={{color: selected ? 'red' :'black'}}>{title}</Text>
	);
};

export default class ProfileHome extends Component{
	render() {
		return (
			<Router>
			<Scene>
				<Scene 
				key="tabbar"
				tabs
				tabBarStyle={{ backgroundColor: '#FFFFFF'}}>
				<Scene key="bot3" hideNavBar={true} icon={TabIcon}>
					<Scene
    					key="loginnow"
    					component={Login}
    					hideNavBar={true}/>
    			</Scene>

    			<Scene key="bot3" hideNavBar={true} icon={TabIcon}>
    				<Scene
    					key="registernow"
    					component={Register}
    					title="Register" />
    			</Scene>

				<Scene key="bot3" hideNavBar={true} icon={TabIcon}>
					<Scene
						key="createnew"
						component={CreateNew}
						title="Add Book"
						initial />
				</Scene>
				</Scene>
			</Scene>
			</Router>
		);
	}
}
