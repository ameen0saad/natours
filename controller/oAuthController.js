const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const Strategy = require('passport-google-oauth2');

const User = require('../model/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const Verification = require('../model/verificationEmail');
const { access } = require('fs');

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
    status: 'success',
    token: token,
    data: user,
  });
};

passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://127.0.0.1:3000/api/v1/users/auth/google/callback',
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.email });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos[0].value,
            verified: true,
          });

          await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

exports.googleAuthCallBack = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('OAuth Error:', err);
      return next(new AppError(err, 401));
    }
    if (!user) {
      return next(new AppError('Login failed - no user found', 401));
    }
    const token = signToken(user.id, process.env.JWT_EXPIRES_IN);

    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    res.cookie('JWT', token, cookieOption);
    res.status(200).redirect('/');
  })(req, res, next);
};
