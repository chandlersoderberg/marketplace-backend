const Admin = require('../models/Admin');
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
 * @desc    Admin Login API
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // In a real app we'd hash admin passwords, but here we're using a simple text match 
    // or bcrypt if we seeded it. Let's assume the seeder uses simple text or bcrypt.
    // To be safe and standard, let's use bcrypt if the password starts with $2a$ (bcrypt hash)
    // otherwise fallback to plain text for simplicity in this assignment.
    let isMatch = false;
    if (admin) {
        if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else {
            isMatch = (password === admin.password);
        }
    }

    if (admin && isMatch) {
      res.status(200).json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new Seller
 * @route   POST /api/admin/sellers
 * @access  Private/Admin
 */
const createSeller = async (req, res, next) => {
  try {
    const { name, email, mobileNo, country, state, skills, password } = req.body;

    // Validate input fields
    if (!name || !email || !mobileNo || !country || !state || !skills || !password) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Check if seller already exists
    const sellerExists = await Seller.findOne({ email });
    if (sellerExists) {
      res.status(400);
      throw new Error('Seller already exists with this email');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the seller
    const seller = await Seller.create({
      name,
      email,
      mobileNo,
      country,
      state,
      skills,
      password: hashedPassword,
    });

    if (seller) {
      res.status(201).json({
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        message: 'Seller created successfully',
      });
    } else {
      res.status(400);
      throw new Error('Invalid seller data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all Sellers with Pagination
 * @route   GET /api/admin/sellers
 * @access  Private/Admin
 */
const listSellers = async (req, res, next) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch sellers, excluding their passwords
    const sellers = await Seller.find().select('-password').skip(skip).limit(limit);
    
    // Total count for pagination metadata
    const total = await Seller.countDocuments();

    res.status(200).json({
      sellers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  createSeller,
  listSellers,
};
