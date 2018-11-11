// import React, { Component } from 'react';
// import { View } from 'react-native';
// import { LoginButton } from 'react-native-fbsdk';

// const FBSDK = require('react-native-fbsdk');

// const {
//   LoginManager,
//   AccessToken,
// } = FBSDK;

// export const loginFacebook() {
//   return (dispatch) => {
//     LoginManager.logInWithReadPermissions(['public_profile', 'user_friends', 'email'])
//       .then(
//         (result) => {
//           if (result.isCancelled) {
//             Alert.alert('Whoops!', 'You cancelled the sign in.');
//           } else {
//             AccessToken.getCurrentAccessToken()
//             .then((data) => {
//               const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
//               firebase.auth().signInWithCredential(credential)
//               .then(loginUserSuccess(dispatch))
//               .catch((error) => {
//                 loginSingUpFail(dispatch, error.message);
//               });
//             });
//           }
//         },
//         (error) => {
//           Alert.alert('Sign in error', error);
//         },
//       );
//   };
// };


// export default class FBLoginButton extends Component {
//   render() {
//     return (
//       <View>
//         <LoginButton
//           publishPermissions={["publish_actions"]}
//           onLoginFinished={
//             (error, result) => {
//               if (error) {
//                 alert("Login failed with error: " + error.message);
//               } else if (result.isCancelled) {
//                 alert("Login was cancelled");
//               } else {
//                 alert("Login was successful with permissions: " + result.grantedPermissions)
//               }
//             }
//           }
//           onLogoutFinished={() => alert("User logged out")}/>
//       </View>
//     );
//   }
// };


// module.exports = loginFacebook;