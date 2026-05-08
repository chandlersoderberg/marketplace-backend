const express = require('express');
const router = express.Router();
const { sellerLogin } = require('../controllers/sellerController');

// Public route for seller login
router.post('/login', sellerLogin);

module.exports = router;
