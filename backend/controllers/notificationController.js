const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: req.user.role })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Ensure the user role matches the notification role
    if (notification.role !== req.user.role) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this notification' });
    }

    notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
