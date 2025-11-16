const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(
        new AppError(`Document not found with this id : ${req.params.id}`, 404),
      );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.body.guides) {
      if (req.body.addGuide) {
        await Model.findByIdAndUpdate(
          req.params.id,
          { $addToSet: { guides: req.body.guides } },
          {
            new: true,
            runValidators: true,
          },
        );
      } else if (req.body.deleteGuide) {
        await Model.findByIdAndUpdate(
          req.params.id,
          { $pull: { guides: req.body.guides } },
          {
            new: true,
            runValidators: true,
          },
        );
      }
      delete req.body.guides;
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(`Document not found with this id : ${req.params.id}`, 404),
      );
    }

    res.status(200).json({
      status: 'success',
      data: { Data: doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { Data: newDoc },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`Document not found with this id : ${req.params.id}`, 404),
      );
    }
    res.status(200).json({
      Status: 'success',
      requestedTime: req.requestTime,
      data: { Data: doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //TODO : Execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      Status: 'success',
      requestedTime: req.requestTime,
      result: doc.length,
      data: { Data: doc },
    });
  });

/*
🟡 FULL BODY: { guides:  '5c8a1f292f8fb814b56fa184', deleteGuide: true }
🟡 ID param: 5c88fa8cf4afda39709c2955       
🟡 Guide to delete: 5c8a1f292f8fb814b56fa184
🟡 delete:  true

🟡 FULL BODY: { guides:  '5c8a1d5b0190b214360dc057', deleteGuide: true }
🟡 ID param: 5c88fa8cf4afda39709c2955
🟡 Guide to delete: 5c8a1d5b0190b214360dc057
🟡 delete:  true

*/
