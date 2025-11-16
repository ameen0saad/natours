# Natours API 🌍

A fully functional RESTful API and web application for booking adventure tours. Built with Node.js, Express, and MongoDB, featuring JWT authentication, payment processing, real-time maps, and comprehensive tour management.

## ✨ Features

- **User Authentication**: JWT-based authentication with email verification and OAuth 2.0 (Google)
- **Tour Management**: Create, read, update, and delete tours with rich details
- **Booking System**: Stripe payment integration for secure tour bookings
- **Review System**: Users can rate and review tours
- **Role-Based Access Control**: Admin, lead guide, guide, and user roles
- **Geolocation**: Mapbox integration for tour locations and distance calculations
- **Image Processing**: Multer and Sharp for image uploads and resizing
- **Email Notifications**: SendGrid integration for transactional emails
- **Password Management**: Secure password reset with token expiration
- **Admin Dashboard**: Manage tours, users, guides, bookings, and reviews

## 🛠️ Architecture: MVC Pattern

Natours follows the **Model-View-Controller (MVC)** architectural pattern:

- **Model** (`/model`): Mongoose schemas define data structure and database interactions
- **View** (`/views`): Pug templates render HTML for browser and email responses
- **Controller** (`/controller`): Business logic handles user requests and responses

This separation of concerns makes the codebase maintainable, scalable, and easy to test.

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), Passport.js
- **Frontend**: Pug Template Engine (MVC View Layer)
- **Payments**: Stripe API
- **Maps**: Mapbox API
- **Email**: Nodemailer with SendGrid/Turbo SMTP
- **Image Processing**: Multer, Sharp
- **Security**: Helmet, Express Rate Limiting, MongoDB Sanitize
- **Development**: Nodemon, ESLint, Prettier

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Stripe account
- SendGrid or Turbo SMTP account
- Google OAuth credentials
- Mapbox API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ameen0saad/natours.git
cd natours
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory with the following configuration:

```env
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/natours
DATABASE_PASSWORD=your_database_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_FROM=noreply@natours.com
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password

# Turbo SMTP (Production)
TURBO_USERNAME=your_turbo_username
TURBO_PASSWORD=your_turbo_password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mapbox
MAPBOX_TOKEN=pk_your_mapbox_token
```

### 4. Start the Server

**Development mode** (with auto-reload):
```bash
npm start
```

**Production mode**:
```bash
npm run start:prod
```

**Debug mode**:
```bash
npm run debug
```

The server will run on `http://localhost:3000`

## 📁 Project Structure

```
natours/
├── controller/              # Business logic and route handlers
│   ├── authController.js
│   ├── tourController.js
│   ├── userController.js
│   ├── reviewController.js
│   ├── bookingController.js
│   ├── viewsController.js
│   └── errorController.js
├── model/                   # Mongoose schemas
│   ├── tourmodel.js
│   ├── userModel.js
│   ├── reviewModel.js
│   ├── bookingModel.js
│   └── verificationEmail.js
├── routes/                  # API route definitions
│   ├── tourRoutes.js
│   ├── userRoutes.js
│   ├── reviewRoutes.js
│   ├── bookingRoutes.js
│   └── viewRoutes.js
├── views/                   # Pug templates
│   ├── email/              # Email templates
│   ├── tour.pug
│   ├── account.pug
│   ├── login.pug
│   └── ...
├── public/                  # Static assets
│   ├── css/
│   ├── js/
│   └── img/
├── utils/                   # Helper functions
│   ├── appError.js
│   ├── catchAsync.js
│   ├── apiFeatures.js
│   └── email.js
├── app.js                   # Express app configuration
├── server.js                # Server entry point
└── config.env               # Environment variables
```

## 🏗️ MVC Architecture in Action

### How MVC Works in Natours

**1. Route → Controller → Model → View → Response**

```
User Request
    ↓
Route (routes/*.js) - Defines endpoints
    ↓
Controller (controller/*.js) - Processes logic
    ↓
Model (model/*.js) - Interacts with database
    ↓
View (views/*.pug) - Renders response
    ↓
Response to Client
```

### Example: Getting a Tour

```
GET /tour/paris-city-tour
    ↓
Route: router.get('/:slug', viewsController.getTour)
    ↓
Controller: exports.getTour = catchAsync(async (req, res, next) => {
              const tour = await Tour.findOne({ slug: req.params.slug });
              res.render('tour', { tour });
            })
    ↓
Model: Tour.findOne() - Queries MongoDB
    ↓
View: tour.pug - Renders HTML with tour data
    ↓
Browser displays tour details
```

### Directory Organization by MVC

| Layer | Directory | Purpose |
|-------|-----------|---------|
| **Model** | `/model` | Data schemas (Tour, User, Review, Booking) |
| **View** | `/views` | Pug templates for rendering HTML |
| **Controller** | `/controller` | Request handlers and business logic |
| **Routes** | `/routes` | Endpoint definitions |
| **Utils** | `/utils` | Helper functions and middleware |

### Key MVC Principles in Natours

1. **Separation of Concerns**: Each layer has distinct responsibility
2. **Reusability**: Controllers use factory pattern for common operations
3. **Testability**: Business logic isolated from routing
4. **Maintainability**: Clear structure makes updates easier
5. **Scalability**: Easy to add new features without affecting existing code

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Create new account
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/logout` - Logout user
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password
- `GET /api/v1/users/auth/google` - Google OAuth login
- `GET /verifyEmail/:token` - Verify email address

### Tours
- `GET /api/v1/tours` - Get all tours
- `POST /api/v1/tours` - Create tour (admin/lead-guide only)
- `GET /api/v1/tours/:id` - Get specific tour
- `PATCH /api/v1/tours/:id` - Update tour (admin/lead-guide only)
- `DELETE /api/v1/tours/:id` - Delete tour (admin/lead-guide only)
- `GET /api/v1/tours/top-5-cheap` - Get 5 cheapest tours
- `GET /api/v1/tours/tour-state` - Get tour statistics
- `GET /api/v1/tours/tour-within/:distance/center/:latlng/unit/:unit` - Geospatial query
- `GET /api/v1/tours/distances/:latlng/unit/:unit` - Get distances from location

### Reviews
- `GET /api/v1/tours/:tourId/reviews` - Get all reviews for a tour
- `POST /api/v1/tours/:tourId/reviews` - Create review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get specific user
- `PATCH /api/v1/users/updateMe` - Update current user profile
- `PATCH /api/v1/users/updatePassword` - Update password
- `DELETE /api/v1/users/deleteMe` - Deactivate account
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### Bookings
- `GET /api/v1/booking/checkout-session/:tourId` - Create Stripe checkout session
- `GET /api/v1/booking` - Get all bookings (admin/lead-guide only)
- `POST /api/v1/booking` - Create booking
- `PATCH /api/v1/booking/:id` - Update booking
- `DELETE /api/v1/booking/:id` - Delete booking

### Web Views
- `GET /` - Home page with all tours
- `GET /tour/:slug` - Tour detail page
- `GET /login` - Login page
- `GET /signup` - Signup page
- `GET /me` - User account page
- `GET /my-tours` - User bookings
- `GET /my-review` - User reviews
- `GET /manage-tours` - Manage tours (admin/lead-guide)
- `GET /manage-users` - Manage users (admin)
- `GET /manage-reviews` - Manage reviews (admin)
- `GET /manage-bookings` - Manage bookings (admin)

## 🔐 Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **Rate Limiting**: Prevents abuse with 100 requests per hour per IP
- **MongoDB Sanitization**: Prevents NoSQL injection attacks
- **Input Validation**: Validates all user inputs
- **Password Encryption**: Bcrypt for secure password hashing
- **CORS**: Cross-Origin Resource Sharing configuration
- **XSS Protection**: HTML sanitization
- **HPP**: HTTP Parameter Pollution protection

## 🛡️ Error Handling

The application includes comprehensive error handling with:
- Custom error classes (AppError)
- Global error middleware
- Async error wrapper
- Detailed error messages in development
- Generic error messages in production

## 📧 Email Templates

The project includes several email templates:
- **Welcome Email**: Sent after successful registration
- **Email Verification**: Verify email address during signup
- **Password Reset**: Reset password link
- **Custom Styling**: Responsive email design

## 🔄 Authentication Flow

1. User signs up with email verification
2. Email verification token sent to inbox
3. User clicks verification link
4. Account verified and user can login
5. JWT token issued on login
6. Token sent in Authorization header or stored as httpOnly cookie
7. Protected routes check token validity

## 🎨 Frontend Features

- Responsive design with modern CSS
- Interactive maps with Mapbox integration
- Real-time tour search and filtering
- Review system with star ratings
- Secure payment checkout with Stripe
- User profile management
- Admin dashboard

## 📊 Database Models

### Tour
- Basic info: name, duration, difficulty, price
- Locations and start dates
- Image gallery
- Ratings and reviews
- Guide assignments
- Geolocation data

### User
- Profile: name, email, photo
- Authentication: password hash, reset tokens
- Roles: user, admin, lead-guide, guide
- Account status: verified, active

### Review
- Rating (1-5 stars)
- Review text
- Reference to tour and user
- Calculated average ratings

### Booking
- Tour reference
- User reference
- Price at booking time
- Payment status
- Creation timestamp

## 🚦 Running Tests

Currently, no automated tests are configured. Consider adding Jest or Mocha for comprehensive testing.

## 📝 ESLint & Prettier Configuration

The project uses ESLint with Airbnb configuration and Prettier for code formatting:

```bash
# Check code style
npx eslint .

# Format code
npx prettier --write .
```

## 🌐 Deployment

To deploy to production:

1. Set `NODE_ENV=production`
2. Use production database connection string
3. Configure secure email service
4. Enable HTTPS and secure cookies
5. Set up environment variables on hosting platform


## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and patterns.

## 📄 License

ISC

## 👤 Author

Ameen Saad


**Happy touring! 🎉**
