const mongoose = require('mongoose');
const Order = require('../models/Order');

// @desc    Get sales summary (Admin only)
// @route   GET /api/sales/summary
// @access  Private/Admin
exports.getSalesSummary = async (req, res) => {
  try {
    // 1. Total Revenue and Order Count
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // 2. Best Selling Products
    const bestSellers = await Order.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalQuantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          name: '$productDetails.name',
          SKU: '$productDetails.SKU',
          totalQuantity: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: stats.length > 0 ? stats[0].totalRevenue : 0,
        totalOrders: stats.length > 0 ? stats[0].totalOrders : 0,
        bestSellers
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get personal sales overview (User)
// @route   GET /api/sales/user
// @access  Private
exports.getUserSales = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const recentPurchases = await Order.find({ user: req.user.id })
      .populate('products.product', 'name price')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalSpent: stats.length > 0 ? stats[0].totalSpent : 0,
        totalOrders: stats.length > 0 ? stats[0].totalOrders : 0,
        recentPurchases
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
