const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  mobileNo: {
    type: String,
    required: [true, 'Mobile number is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  skills: {
    type: [String],
    required: [true, 'At least one skill is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    default: 'seller', // Hardcoded role
  }
}, {
  timestamps: true,
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
