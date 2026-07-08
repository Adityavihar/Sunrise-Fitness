const Gallery = require('../models/Gallery');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryImages = async (req, res) => {
  try {
    const { category, limit } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    let dbQuery = Gallery.find(query).sort({ createdAt: -1 });

    if (limit) {
      dbQuery = dbQuery.limit(Number(limit));
    }

    const images = await dbQuery;
    res.status(200).json({ success: true, count: images.length, images });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving gallery' });
  }
};

// @desc    Upload new image to gallery
// @route   POST /api/gallery
// @access  Private/Admin
const uploadGalleryImage = async (req, res) => {
  try {
    const { category, caption, isHeroBanner } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Please specify an image category' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = getFileUrl(req.file, req);
    const heroFlag = isHeroBanner === 'true' || isHeroBanner === true;

    // If setting as hero banner, reset other hero flags
    if (heroFlag) {
      await Gallery.updateMany({}, { isHeroBanner: false });
    }

    const image = await Gallery.create({
      imageUrl,
      category,
      caption: caption || '',
      isHeroBanner: heroFlag
    });

    res.status(201).json({ success: true, message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Upload gallery image error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading gallery image' });
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await image.deleteOne();
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting gallery image' });
  }
};

module.exports = {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage
};
