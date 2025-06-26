# Natours API 🌍

Natours is a fully functional RESTful API for booking tours, built with Node.js, Express, and MongoDB. It includes JWT authentication, user roles, booking management, review system, and integration with third-party services like Stripe, Mapbox, and SendGrid.

---

## 📦 Technologies Used

- Node.js
- Express.js
- MongoDB & Mongoose
- Pug Template Engine
- Stripe API (Payment)
- Mapbox API (Geolocation)
- SendGrid (Email service)
- Multer + Sharp (Image upload and processing)
- JWT Authentication + Role-based Access Control

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ameen0saad/natours.git
cd natours
```
## Install Dependencies
-npm install

 ## Environment Variables Setup
-NODE_ENV=development
-PORT=3000
-DATABASE=<your_mongodb_connection_string>
-DATABASE_PASSWORD=<your_password>
-JWT_SECRET=<your_jwt_secret>
-JWT_EXPIRES_IN=90d
-JWT_COOKIE_EXPIRES_IN=90
-EMAIL_USERNAME=<your_sendgrid_email>
-EMAIL_PASSWORD=<your_sendgrid_password>
-EMAIL_HOST=smtp.sendgrid.net
-STRIPE_SECRET_KEY=<your_stripe_key>
-STRIPE_WEBHOOK_SECRET=<your_stripe_webhook>


## 📁 Project Structure
natours/
│
├── controllers/       # Business logic
├── models/            # Mongoose schemas
├── routes/            # API routes
├── public/            # Static files (CSS, JS, Images)
├── views/             # Pug templates
├── utils/             # Helper functions
├── dev-data/          # Sample data for development
├── app.js / server.js # Entry point
└── config.env         # Environment configuration

