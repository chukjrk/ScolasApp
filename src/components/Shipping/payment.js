import React, { Component } from 'react';
import { View, Button } from 'react-native';
import stripe from 'tipsi-stripe';
import { doPayment } from '../../services/api';
import { firebaseRef } from '../../services/Firebase'

stripe.setOptions({
  publishableKey: 'pk_test_Kt0xEhtPWyoHgMUjKsphNXKh',
  androidPayMode: 'test', // change for "production"
});

export default class Payment extends Component {
  requestPayment = () => {
    return stripe
      .paymentRequestWithCardForm()
      .then(stripeTokenInfo => {
        console.warn('Token created', { stripeTokenInfo });
          // firebase.database().ref(`/stripe_customers/${this.currentUser.uid}/sources`).push({token: stripeTokenInfo.id}).then(() => {
            firebaseRef.database().ref('/stripe_customers/' + firebaseRef.auth().currentUser.uid + '/charges').push({
              source: stripeTokenInfo.tokenId,
              amount: 100
            });
          // });
      })
      .catch(error => {
        console.warn('Payment failed', { error });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Make a payment"
          onPress={this.requestPayment}
          // disabled={this.state.isPaymentPending}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
