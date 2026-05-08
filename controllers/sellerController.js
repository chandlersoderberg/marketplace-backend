const Seller = require('../models/Seller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generate a JWT token.
 * @param {string} id - The user ID
 * @param {string} role - The user role
 * @returns {string} - The signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Seller Login API
 * @route   POST /api/seller/login
 * @access  Public
 */
const sellerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find seller by email
    const seller = await Seller.findOne({ email });

    // Verify password
    if (seller && (await bcrypt.compare(password, seller.password))) {
      res.status(200).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        token: generateToken(seller._id, seller.role),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sellerLogin,
};
