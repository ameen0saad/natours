const express = require('express');
const viewsController = require('../controller/viewsController');
const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

const router = express();

router.get('/signup', viewsController.getSignupForm);

router.get(
  '/tourForm',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.createTour,
);

router.get(
  '/tourForm/:slug',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.updateTour,
);

router.get('/', authController.isLoggedin, viewsController.getOverView);
router.get(
  '/top-5-cheap',
  authController.isLoggedin,
  viewsController.getTopFiveCheap,
);
router.get('/tour/:slug', authController.isLoggedin, viewsController.getTour);

//TODO : Login
router.get('/login', authController.isLoggedin, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.manageTours,
);

router.get(
  '/tour-guides/:slug',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.manageToursGuides,
);
router.get(
  '/manage-reviews',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getReview,
);
router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getAllUser,
);

router.get(
  '/manage-bookings',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getAllBooking,
);

router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours,
);
router.get('/my-review', authController.protect, viewsController.getMyReview);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

router.get('/resetPassword/:resetToken', viewsController.resetPassword);
router.get('/forgetPassword', viewsController.forgetPassword);
router.get('/verifyEmail/:token', authController.verifyEmail);
module.exports = router;
