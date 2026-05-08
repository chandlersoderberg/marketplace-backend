const jwt = require('jsonwebtoken');

/**
 * General authentication middleware to verify JWT token.
 * Attached the decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
  let token;
  // Check if token is passed in the authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the decoded payload (like id and role) to req.user
      req.user = decoded;
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
};

/**
 * Middleware to check if the authenticated user is an Admin.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

/**
 * Middleware to check if the authenticated user is a Seller.
 */
const isSeller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a seller');
  }
};

module.exports = { verifyToken, isAdmin, isSeller };
