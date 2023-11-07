const express = require('express');
const router = require('./routes/index');
const {pool} = require('./db/db.js');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const stripe = require("stripe")('sk_test_51O7U0SDOPQAnLsiZnW4nKk6kyc1UtdiN6aRSmK2iPhLl2hiu0uwyw4Apd78CqVqth6kutOCodTEi6BCU22PP8uRu00XFvpLzZD');



const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const app = express();
app.use(express.static(path.join(__dirname, 'build')));

// Define a catch-all route to serve your React app's HTML file


app.use(cors({
    origin:"*"
}))
app.use('/public/uploads',express.static(__dirname + '/public/uploads/'))

app.use(bodyParser.json());


const server = app.listen(8080, (req, res)=>{
    console.log('App running')
})
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "gbp",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router(app, pool);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});










