const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const sanitize = require('sanitize');
const hpp = require('hpp');
const path = require('path');

const cors = require('cors');

const AppError = require('./utils/appError');
const globalError = require('./controller/ErrorController');
const routeTour = require('./routes/tourRoutes');
const routeUser = require('./routes/userRoutes');
const routeReview = require('./routes/reviewRoutes');
const routeBooking = require('./routes/bookingRoutes');

const app = express();
app.use(cors({ origin: '*' }));
app.use(
  '/img/tours',
  express.static(path.join(__dirname, 'public', 'img', 'tours')),
);

// TODO : Global middleware
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// TODO : Limit requests from same IP
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP please try again in an hour',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(sanitize.middleware);
app.use(hpp({ whitelist: ['duration'] }));
// TODO : Test the middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', routeTour);
app.use('/api/v1/users', routeUser);
app.use('/api/v1/reviews', routeReview);
app.use('/api/v1/booking', routeBooking);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

module.exports = app;
