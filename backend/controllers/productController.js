const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private (All Users)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add a product
// @route   POST /api/products
// @access  Private/Admin
exports.addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // Emit socket event
    if (req.io) {
      req.io.emit('productCreated', product);
    }

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Product SKU already exists' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('productUpdated', product);
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.deleteOne();

    // Emit socket event
    if (req.io) {
      req.io.emit('productDeleted', product._id);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
