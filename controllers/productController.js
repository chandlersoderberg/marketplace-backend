const Product = require('../models/Product');
const generateProductPdf = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Add a new Product
 * @route   POST /api/products
 * @access  Private/Seller
 */
const addProduct = async (req, res, next) => {
  try {
    const { productName, productDescription } = req.body;
    let brandsData = req.body.brands;

    // Validate main product fields
    if (!productName || !productDescription || !brandsData) {
      res.status(400);
      throw new Error('Please provide productName, productDescription, and brands');
    }

    // Since we're using form-data for file uploads, `brands` might come as a stringified JSON array
    if (typeof brandsData === 'string') {
      try {
        brandsData = JSON.parse(brandsData);
      } catch (err) {
        res.status(400);
        throw new Error('Invalid brands format. Must be a valid JSON array string when using form-data');
      }
    }

    if (!Array.isArray(brandsData) || brandsData.length === 0) {
      res.status(400);
      throw new Error('At least one brand is required');
    }

    // Process uploaded files and map them to their corresponding brands
    // We expect the files to be uploaded with field name 'brandImages'
    // Ensure the order matches or the user explicitly assigns it
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('Please upload brand images');
    }
    
    if (req.files.length !== brandsData.length) {
        res.status(400);
        throw new Error('Number of uploaded images must match number of brands');
    }

    const brands = brandsData.map((brand, index) => {
      if (!brand.brandName || !brand.detail || !brand.price) {
        res.status(400);
        throw new Error('Each brand must have brandName, detail, and price');
      }

      return {
        brandName: brand.brandName,
        detail: brand.detail,
        price: Number(brand.price),
        image: `/uploads/brands/${req.files[index].filename}`, // Store relative path
      };
    });

    // Create the product
    const product = await Product.create({
      sellerId: req.user.id, // Authenticated seller's ID
      productName,
      productDescription,
      brands,
    });

    res.status(201).json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List Seller's Products with Pagination
 * @route   GET /api/products
 * @access  Private/Seller
 */
const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find products belonging only to the authenticated seller
    const products = await Product.find({ sellerId: req.user.id })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ sellerId: req.user.id });

    res.status(200).json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Product
 * @route   DELETE /api/products/:id
 * @access  Private/Seller
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ensure the authenticated seller owns this product
    if (product.sellerId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    // Optional: Delete associated images from the filesystem
    product.brands.forEach((brand) => {
      const imagePath = path.join(__dirname, '..', 'public', brand.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await product.deleteOne();

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    View PDF for a Product
 * @route   GET /api/products/:id/pdf
 * @access  Private/Seller
 */
const viewProductPdf = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if the seller owns the product (if we want this protected to the owner only)
    if (product.sellerId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this product PDF');
    }

    // Create a write stream or stream directly to response
    // For this example, we will generate the PDF and stream it directly to the response object
    
    // Set headers to indicate a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=product_${product._id}.pdf`);

    // Call our utility to generate and pipe the PDF to the response
    generateProductPdf(product, res);
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  listProducts,
  deleteProduct,
  viewProductPdf
};
