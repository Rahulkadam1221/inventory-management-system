const express = require('express');
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route('/')
  .get(getProducts)
  .post(authorize('Admin'), addProduct);

router
  .route('/:id')
  .put(authorize('Admin'), updateProduct)
  .delete(authorize('Admin'), deleteProduct);

module.exports = router;
