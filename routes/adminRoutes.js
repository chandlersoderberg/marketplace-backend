const express = require('express');
const router = express.Router();
const { adminLogin, createSeller, listSellers } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Public route for admin login
router.post('/login', adminLogin);

// Protected routes (Admin only)
// Note: verifyToken ensures the user is logged in, isAdmin ensures they have the admin role
router.post('/sellers', verifyToken, isAdmin, createSeller);
router.get('/sellers', verifyToken, isAdmin, listSellers);

module.exports = router;
