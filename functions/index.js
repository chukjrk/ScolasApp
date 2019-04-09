'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  },
});

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'BooXchange';

// [START sendWelcomeEmail]
/**
 * Sends a welcome email to new user.
 */
// [START onCreateTrigger]
exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
// [END onCreateTrigger]
  // [START eventAttributes]
  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user.
  // [END eventAttributes]

  return sendWelcomeEmail(email, displayName);
});
// [END sendWelcomeEmail]

// [START sendByeEmail]
/**
 * Send an account deleted email confirmation to users who delete their accounts.
 */
// [START onDeleteTrigger]
exports.sendByeEmail = functions.auth.user().onDelete((user) => {
// [END onDeleteTrigger]
  const email = user.email;
  const displayName = user.displayName;

  return sendGoodbyeEmail(email, displayName);
});
// [END sendByeEmail]

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@booxchange.com>`,// from: `${APP_NAME} <noreply@firebase.com>`,
    to: email,
  };

  // The user subscribed to the newsletter.
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('New welcome email sent to:', email);
  });
}

// Sends a goodbye email to the given user.
function sendGoodbyeEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email,
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Bye!`;
  mailOptions.text = `Hey ${displayName || ''}!, We confirm that we have deleted your ${APP_NAME} account.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('Account deletion confirmation email sent to:', email);
  });
}

// Send to email  to sender containing shipping label 
// exports.sendLabelEmail = functions.database.ref()
//   .onCreate (() => {
//     mailOptions.subject = `Shipping Label`;
//     mailOptions.text = `Here is your shipping label`
//   })

const logging = require('@google-cloud/logging');
const stripe = require('stripe')(functions.config().stripe.token);
const currency = functions.config().stripe.currency || 'USD';

// [START chargecustomer]
// Charge the Stripe customer whenever an amount is written to the Realtime database
exports.createStripeCharge = functions.database.ref('/stripe_customers/{userId}/charges/{id}')
  .onCreate((snap, context) => {
    const val = snap.val();
    // Look up the Stripe customer id written in createStripeCustomer
    return admin.database().ref(`/stripe_customers/${context.params.userId}/customer_id`)
      .once('value').then((snapshot) => {
        return snapshot.val();
      }).then((customer) => {
        // Create a charge using the pushId as the idempotency key
        // protecting against double charges
        const amount = val.amount;
        const idempotencyKey = context.params.id;
        const charge = {amount, currency, customer};
        if (val.source !== null) {
          charge.source = val.source;
        }
        return stripe.charges.create(charge, {idempotency_key: idempotencyKey});
      }).then((response) => {
        // If the result is successful, write it back to the database
        return snap.ref.set(response);
      }).catch((error) => {
        // We want to capture errors and render them in a user-friendly way, while
        // still logging an exception with StackDriver
        return snap.ref.child('error').set(userFacingMessage(error));
      }).then(() => {
        return reportError(error, {user: context.params.userId});
      });
  });
// [END chargecustomer]]

exports.createStripePayout = functions.database.ref('/stripe_customers/{userId}/charges/{id}')
  .onCreate((snap, context) => {
    const val = snap.val();
    // Look up the Stripe customer id written in createStripeCustomer
    return admin.database().ref(`/stripe_customers/${context.params.userId}/customer_id`)
      .once('value').then((snapshot) => {
        return snapshot.val();
      }).then((customer) => {
        // Create a payout using the account id gotten from the seller account
        // ** need to protect against double payouts
        const amount2 = (val.amount - 200 - 25);
        const idempotencyKey = context.params.id;
        const payout = {amount, currency};

        // Need to get the seller account from the post's user id and seller account
        return stripe.payouts.create({ payout }, {
          stripe_account: "acct_q9819831hh7his" //"{CONNECTED_STRIPE_ACCOUNT_ID}",
        });
      }).then((response) => {
        // If the result is successful, write it back to the database
        return snap.ref.set(response);
      }).catch((error) => {
        // We want to capture errors and render them in a user-friendly way, while
        // still logging an exception with StackDriver
        return snap.ref.child('error').set(userFacingMessage(error));
      }).then(() => {
        return reportError(error, {user: context.params.userId});
      });
  });
// [END chargecustomer]]


// When a user is created, register them with Stripe
exports.createStripeCustomer = functions.auth.user().onCreate((user) => {
  return stripe.customers.create({
    email: user.email,
  }).then((customer) => {
    return admin.database().ref(`/stripe_customers/${user.uid}/customer_id`).set(customer.id);
  });
});

exports.createStripeAccount = functions.database.ref('/stripe_accounts/{userId}/accounts')
  .onCreate((snap, context) => {
    const val = snap.val();
    return admin.database().ref(`/stripe_accounts/${context.params.userId}`)
    .once('value').then((snapshot) => {
      return snapshot.val();
    }).then(() => {
      const firstname = val.firstname;
      const lastname = val.lastname;
      // const address_line1 = val.address.line1;
      // const address_line2 = val.address.line2;
      // const address_city = val.address.city;
      // const address_state = val.address.state;
      // const address_postal = val.address.postal_code;
      const ssn = val.ssn_last_4;
      const email = val.email;
      const phone = val.phone;
      const dob_day = val.dob_day
      const dob_month = val.dob_month
      const dob_year = val.dob_year
      const acct_number = val.account_number
      const routing_number = val.routing_number
      // const token = ;

      // return stripe.createToken('person', {
      //   person: {
      //     first_name: document.querySelector('.inp-person-first-name').value,
      //     last_name: document.querySelector('.inp-person-last-name').value,
      //     address: {
      //       line1: document.querySelector('.inp-person-street-address1').value,
      //       city: document.querySelector('.inp-person-city').value,
      //       state: document.querySelector('.inp-person-state').value,
      //       postal_code: document.querySelector('.inp-person-zip').value,
      //     },
      //   },
      //   tos_shown_and_accepted: true, 
      // });

      return stripe.accounts.create({
        business_type: 'individual',
        business_profile: {
          product_description: 'Books rented on BooXchange',
          support_phone: phone,
        },
        country: 'US',
        type: 'custom',
        requested_capabilities: ['card_payments'],
        individual: {
          // address: {
          //   city: address_city,
          //   country: 'US',
          //   line1: address_line1,
          //   postal_code: address_postal,
          //   state: address_state,
          // },
          dob: {
            day: dob_day,
            month: dob_month,
            year: dob_year
          },
          email: email,
          first_name: firstname,
          last_name: lastname,
          phone: phone,
          ssn_last_4: ssn,
        },
        // account_token: token,
        tos_shown_and_accepted: true 
      });
    }).then((response) => {
      // If the result is successful, write it back to the database
      return snap.ref.set(response);
    }).catch((error) => {
      // We want to capture errors and render them in a user-friendly way, while
      // still logging an exception with StackDriver
      return snap.ref.child('error').set(userFacingMessage(error));
    }).then(() => {
      return reportError(error, {user: context.params.userId});
    });
  })

// exports.createStripeAccount = functions.database.ref().onUpdate(() => {
//   return stripe.accounts.update({
//     {CONNECTED_STRIPE_ACCOUNT_ID},
//     metadata: {internal_id: 42},
//   }).then(functoin(acct) {
//     country: 'US',
//     type: 'custom',
//     requested_capabilities: ['card_payments'],
//   })
//   }).then((customer) => {
//     return admin
//   })
// })

// Add a payment source (card) for a user by writing a stripe payment source token to Realtime database
exports.addPaymentSource = functions.database
  .ref('/stripe_customers/{userId}/sources/{pushId}/token').onWrite((change, context) => {
    const source = change.after.val();
    if (source === null){
      return null;
    }
    return admin.database().ref(`/stripe_customers/${context.params.userId}/customer_id`)
      .once('value').then((snapshot) => {
        return snapshot.val();
      }).then((customer) => {
        return stripe.customers.createSource(customer, {source});
      }).then((response) => {
        return change.after.ref.parent.set(response);
      }, (error) => {
        return change.after.ref.parent.child('error').set(userFacingMessage(error));
      }).then(() => {
        return reportError(error, {user: context.params.userId});
      });
  });

// send message to self anythime there is an order on 
exports.sendShippingLabel = functions.database
  .ref('/posts').onWrite((change, context) => {
    ref.on("child_changed", function(snapshot) {
      var changedPost = snapshot.val();
      console.log("The updated post title is " + changedPost.title);
      const mailOptions = {
        from: `${APP_NAME} <noreply@booxchange.com>`,// from: `${APP_NAME} <noreply@firebase.com>`,
        to: 'officialscolas@gmail.com',
      };
      mailOptions.subject = 'New Order';
      // mailOptions.text = `Hey ${changedPost.puid || ''}! Has just made a purchase under user ID`;
      return mailTransport.sendMail(mailOptions).then(() => {
        return console.log('Order sent to : officialscolas');
      });
    });
  });

// When a user deletes their account, clean up after them
exports.cleanupUser = functions.auth.user().onDelete((user) => {
  return admin.database().ref(`/stripe_customers/${user.uid}`).once('value').then(
    (snapshot) => {
      return snapshot.val();
    }).then((customer) => {
      return stripe.customers.del(customer.customer_id);
    }).then(() => {
      return admin.database().ref(`/stripe_customers/${user.uid}`).remove();
    });
});

// To keep on top of errors, we should raise a verbose error report with Stackdriver rather
// than simply relying on console.error. This will calculate users affected + send you email
// alerts, if you've opted into receiving them.
// [START reporterror]
function reportError(err, context = {}) {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  const logName = 'errors';
  const log = logging.log(logName);

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const metadata = {
    resource: {
      type: 'cloud_function',
      labels: {function_name: process.env.FUNCTION_NAME},
    },
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: process.env.FUNCTION_NAME,
      resourceType: 'cloud_function',
    },
    context: context,
  };

  // Write the error log entry
  return new Promise((resolve, reject) => {
    log.write(log.entry(metadata, errorEvent), (error) => {
      if (error) {
       return reject(error);
      }
      return resolve();
    });
  });
}
// [END reporterror]

// Sanitize the error message for the user
function userFacingMessage(error) {
  return error.type ? error.message : 'An error occurred, developers have been alerted';
}