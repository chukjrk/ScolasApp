// import { YOUR_STRIPE_SECRET_KEY } from 'react-native-dotenv'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const stripe = require('stripe')('sk_test_RDRQUc6bLX44bJ1WhHqqQJKZ');

console.warn('WHATS GOOD WHATS REALLY GOOD')

app.post('/pay', (req, res) => {
  return stripe.charges
    .create({
      amount: req.body.amount, // Unit: cents
      currency: 'eur',
      source: req.body.tokenId,
      description: 'Test payment',
    })
    .then(result => res.status(200).json(result));
});

app.listen(8081);