const Review = require('../model/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.deleteOwnReview = async (req, res, next) => {
  if (req.user.role !== 'user') return next();
  const filter = { user: req.user.id, _id: req.params.id };
  const review = await Review.findOne(filter);
  if (!review)
    return next(
      new AppError(
        'This is not your Review you can not delete or update .',
        401,
      ),
    );
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
