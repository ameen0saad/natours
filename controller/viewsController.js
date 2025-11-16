const Tour = require(`../model/tourmodel`);
const User = require(`../model/userModel`);
const Booking = require('../model/bookingModel');
const Review = require('../model/reviewModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/CatchAsync');

exports.getOverView = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours ',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account ',
  });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Signup form ',
  });
});

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.manageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('manageTours', {
    title: 'Manage tour',
    tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  res.status(200).render('tourForm', {
    title: 'Manage tour',
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  res.status(200).render('tourForm', {
    title: 'Manage tour',
    tour,
  });
});

exports.manageToursGuides = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  const users = await User.find({ role: { $in: ['lead-guide', 'guide'] } });
  const guideId = tour.guides.map((ele) => ele._id);
  const guides = await User.find({ _id: { $in: guideId } });
  res.status(200).render('tourGuidesForm', {
    title: 'Manage guides',
    tour,
    guides,
    users,
  });
});

exports.getMyReview = catchAsync(async (req, res, next) => {
  const myReview = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug',
  });
  res.status(200).render('myReview', {
    title: 'My review',
    myReview,
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tour',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $unwind: '$tour',
    },
    {
      $sort: { 'user.name': 1 },
    },
    {
      $project: {
        review: 1,
        rating: 1,
        'user.name': 1,
        'user.photo': 1,
        'tour.name': 1,
        'tour.slug': 1,
      },
    },
  ]);

  res.status(200).render('review', {
    title: 'Manage reviews',
    reviews,
  });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find().sort('role name');
  res.status(200).render('user', {
    title: 'Manage users',
    users,
  });
});

exports.getTopFiveCheap = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).render('getTopFiveCheap', {
    title: 'Get top five tour',
    tours,
  });
});
exports.getAllBooking = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find();
  res.status(200).render('bookings', {
    title: 'All booking',
    bookings,
  });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'account',
    user: updateUser,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'Reset Password',
    token: req.params.resetToken,
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('forgetPassword', {
    title: 'Forget Password',
  });
});
