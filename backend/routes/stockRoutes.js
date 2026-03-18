const express = require('express');
const router = express.Router();
const { adjustStock } = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/adjust', protect, authorize('Admin'), adjustStock);

module.exports = router;
