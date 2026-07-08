const Product = require('../models/Product');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Get all products (with filters)
// @route   GET /api/supplements
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, isAdminView } = req.query;
    let query = { isActive: true };

    // If request has admin view query and user is admin, show all
    if (isAdminView === 'true' && req.user && req.user.role === 'admin') {
      query = {};
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving products' });
  }
};

// @desc    Get single product details
// @route   GET /api/supplements/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving product details' });
  }
};

// @desc    Create a product
// @route   POST /api/supplements
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock } = req.body;

    if (!name || !category || !description || !price || !stock) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a product image' });
    }

    const imageUrl = getFileUrl(req.file, req);

    const product = await Product.create({
      name,
      category,
      description,
      price: Number(price),
      stock: Number(stock),
      image: imageUrl
    });

    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/supplements/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    if (isActive !== undefined) product.isActive = isActive;

    if (req.file) {
      product.image = getFileUrl(req.file, req);
    }

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/supplements/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
