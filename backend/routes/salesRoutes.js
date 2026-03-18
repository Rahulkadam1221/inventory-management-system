const express = require('express');
const { getSalesSummary, getUserSales } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', authorize('Admin'), getSalesSummary);
router.get('/user', getUserSales);

module.exports = router;
