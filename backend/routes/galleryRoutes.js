const express = require('express');
const router = express.Router();
const {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route to view gallery
router.get('/', getGalleryImages);

// Admin-only routes to modify gallery
router.post('/', protect, authorize('admin'), upload.single('image'), uploadGalleryImage);
router.delete('/:id', protect, authorize('admin'), deleteGalleryImage);

module.exports = router;
