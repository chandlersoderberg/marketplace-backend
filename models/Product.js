const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: [true, 'Brand Name is required'],
  },
  detail: {
    type: String,
    required: [true, 'Brand Detail is required'],
  },
  image: {
    type: String, // Store the path to the uploaded image
    required: [true, 'Brand Image is required'],
  },
  price: {
    type: Number,
    required: [true, 'Brand Price is required'],
  }
});

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  productName: {
    type: String,
    required: [true, 'Product Name is required'],
  },
  productDescription: {
    type: String,
    required: [true, 'Product Description is required'],
  },
  brands: {
    type: [brandSchema],
    required: [true, 'At least one brand is required'],
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
