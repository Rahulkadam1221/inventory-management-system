const Product = require('../models/Product');

// @desc    Update stock manually (Add/Reduce)
// @route   POST /api/stock/adjust
// @access  Private/Admin
exports.adjustStock = async (req, res) => {
  try {
    const { productId, type, amount, note } = req.body;

    if (!productId || !type || !amount) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const adjustment = parseInt(amount);
    if (type === 'Add') {
      product.quantity += adjustment;
    } else if (type === 'Reduce') {
      product.quantity = Math.max(0, product.quantity - adjustment);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid adjustment type' });
    }

    await product.save();

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('stockAdjusted', {
        productId: product._id,
        name: product.name,
        newQuantity: product.quantity,
        type,
        amount: adjustment,
        note: note || 'Manual adjustment',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
