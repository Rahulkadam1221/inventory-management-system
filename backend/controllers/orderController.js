const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, error: 'Please add at least one product' });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Calculate total price and verify products
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found with id of ${item.product}` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({
        product: item.product,
        quantity: item.quantity
      });

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user.id,
      products: orderItems,
      totalPrice
    });

    // Emit socket events
    if (req.io) {
      req.io.emit('orderCreated', order);
      // Also emit productUpdated for each product to sync stock in real-time
      for (const item of products) {
        const updatedProduct = await Product.findById(item.product);
        req.io.emit('productUpdated', updatedProduct);
      }
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query;

    // If User, only show their orders
    if (req.user.role !== 'Admin') {
      query = Order.find({ user: req.user.id });
    } else {
      query = Order.find();
    }

    const orders = await query
      .populate('user', 'name email')
      .populate('products.product', 'name SKU price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order = await Order.findByIdAndUpdate(req.params.id, { status }, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('orderUpdated', order);
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
