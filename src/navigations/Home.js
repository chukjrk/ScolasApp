import React, { Component } from 'react';
import { View } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import CreateNew from '../components/Listings/CreateNew';
import StoreView from '../components/Listings/StoreView';
import Profile from '../components/Profile/Profile';

// export const Home = TabNavigator({
// 			Profile: { 
// 				screen: Profile,
// 				navigationOptions: {
// 						tabBarlabel: 'Feed',
// 					//	tabBarIcon: ({tintColor}) => <Icon name="list" size={35} color={tintColor} />
// 				},
// 			},
// 			//Chat: { screen: '' },
// 			Add: { screen: CreateNew },
// 			Store: { screen: StoreView },
// })


// export default class Home extends Component {
// 	render() {
// 		const HomeNavigation = TabNavigator({
// 			Home: { screen: Profile },
// 			//Chat: { screen: '' },
// 			Add: { screen: CreateNew },
// 			Store: { screen: StoreView  },
// 		})

//     return (
//     	<View>
//     		{ HomeNavigation }
//     	</View>
//     );
//   }
// }