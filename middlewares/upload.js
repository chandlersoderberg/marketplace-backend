const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'brands');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Multer storage to save files locally in the public/uploads directory.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Set the destination directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using Date.now() to avoid collisions
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

/**
 * File filter to only allow image files.
 */
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  // Check extension
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimetype
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpeg, jpg, png)'));
  }
};

// Initialize multer with the storage config and file filter
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
