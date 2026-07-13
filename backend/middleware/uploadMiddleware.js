const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let storage;
let isCloudinaryConfigured = false;

// Check if Cloudinary configurations are provided
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'sunrise_fitness_hub',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  });

  isCloudinaryConfigured = true;
  console.log('Cloudinary upload storage configured successfully.');
} else {
  // Memory storage fallback to convert to base64 (permanent database storage)
  storage = multer.memoryStorage();
  console.log('Cloudinary credentials missing. Falling back to memory storage base64 uploads.');
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB Limit for high-resolution images
  }
});

// Helper to extract file path/url depending on backend storage type
const getFileUrl = (file, req) => {
  if (!file) return '';
  if (isCloudinaryConfigured) {
    return file.path; // Cloudinary returns URL in file.path
  } else {
    // Return base64 data URL to store the image permanently in MongoDB Atlas
    try {
      if (file.buffer) {
        const base64Data = file.buffer.toString('base64');
        return `data:${file.mimetype || 'image/jpeg'};base64,${base64Data}`;
      }
      
      // Fallback if buffer is missing but file is on disk
      const host = req && typeof req.get === 'function' ? req.get('host') : 'localhost:5000';
      const protocol = req && req.protocol ? req.protocol : 'http';
      return `${protocol}://${host}/uploads/${file.filename}`;
    } catch (err) {
      console.error('Error generating file URL:', err.message);
      return file.filename ? `/uploads/${file.filename}` : '';
    }
  }
};

module.exports = {
  upload,
  getFileUrl
};
