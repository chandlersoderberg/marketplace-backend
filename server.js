require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorHandler');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

// Route files
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve static files for image uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/products', productRoutes);

// Custom Error Handler middleware (should be placed after all routes)
app.use(errorHandler);

// Helper function to seed default Admin if not exists
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@marketplace.local';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default Admin user seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedDefaultAdmin();
});
