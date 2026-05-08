const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { verifyToken, isSeller } = require('../middlewares/auth');
const {
  addProduct,
  listProducts,
  deleteProduct,
  viewProductPdf
} = require('../controllers/productController');

// All product routes require a verified Seller token
router.use(verifyToken, isSeller);

// Add product requires handling multipart/form-data for image uploads
// We expect a field named 'brandImages' which allows multiple files
router.post('/', upload.array('brandImages'), addProduct);

// List authenticated seller's products
router.get('/', listProducts);

// View product PDF
router.get('/:id/pdf', viewProductPdf);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
