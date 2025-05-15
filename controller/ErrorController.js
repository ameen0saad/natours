const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value} `;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/"[^"]*"/)[0];

  const message = `Duplicate field value: ${value} Please use another value!`;
  return new AppError(message, 400);
};

const handleValidatorErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join(' , ');
  return new AppError(message, 400);
};
const handleJWTError = () => new AppError('Invalid Token please Log in', 401);
const handleJWTExpired = () =>
  new AppError('Yor Token has expired please log in again', 401);
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      Status: err.status,
      message: err.message,
    });
  } else {
    //1) Log error
    console.error('Error 💥', err);
    console.log(process.env.NODE_ENV);
    //send generic message
    res.status(500).json({
      Status: 'Error',
      message: 'Something went very wrong!',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    Status: err.status,
    Error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidatorErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpired();
    sendErrorProd(err, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};
