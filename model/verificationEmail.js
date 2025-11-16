const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  tokenExpiray: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification;
