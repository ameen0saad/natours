const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('JWT', token, cookieOption);
  res.status(statusCode).json({
    Status: 'success',
    token: token,
    data: user,
  });
};

// TODO : SignUp
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

//TODO : Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // ! check if Email and Password exist
  if (!email || !password) {
    return next(new AppError('Please provide Email and Password', 400));
  }

  //  TODO :  check if User exists and password correct
  const user = await User.findOne({ email })
    .select('+password')
    .select('+active');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Email or password is incorrect `, 401));
  }
  if (user.active === false)
    // TODO : Check if user active or not
    return next(
      new AppError('Your account is deactivated. Please contact support.', 403),
    );

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // TODO : 1) Getting Token and check if it there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not Logged in! please log in to get access', 401),
    );
  // TODO : 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  if (!decoded) return next(new AppError(' verification token not valid', 401));

  // TODO : 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exits.',
        401,
      ),
    );

  // TODO : 4) Check if the password has been changed after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password please log in again.', 401),
    );
  }
  // TODO : Grant access to protected route

  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You don`t have permission to access this', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // TODO : 1) Get User based on email
  const { email } = req.body;
  const user = await User.findOne({ email });
  // TODO : 2) Check if user exists
  if (!user)
    return next(new AppError('There is no user for this email address', 404));
  // TODO : 3) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // TODO : 4) Send it to user`s email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    //   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
    // ${resetURL}.\n
    // If you didn't forget your password, please ignore this email!`;

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token  (valid for 10 min)',
    //   message,
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was an error please try later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // TODO : 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // TODO : 2) If token has not expired , and there is user , set the new password
  if (!user) {
    return next(new AppError('the token has expired or invalid ', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // TODO : 3) Log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // TODO : get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user)
    return next(new AppError('please log in to update your password', 401));
  const { passwordCurrent, newPassword, passwordConfirm } = req.body;
  // TODO : check if the current password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password)))
    return next(new AppError('Invalid password please try again', 401));

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // TODO : Log user in and send JWT
  createSendToken(user, 200, res);
});
