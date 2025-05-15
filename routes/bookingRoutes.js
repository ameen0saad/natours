const express = require('express');
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

const route = express.Router();
route.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = route;
