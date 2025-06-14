// ProductRoutes.js
const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySellerId,
} = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const validateRole = require('../middleware/validateRole');
const { upload, handleImageUpload } = require('../middleware/upload');

// Create a product (restricted to SHOP_OWNER and ADMIN)
router.post(
  '/',
  authenticateToken,
  validateRole(['SHOP_OWNER','ADMIN']),
  upload.fields([{ name: 'imageFile' }]),
  handleImageUpload,
  createProduct
);

// Get all products
router.get('/', authenticateToken, validateRole(['ADMIN', 'SHOP_OWNER']), getProducts);

// Get a product by ID
router.get('/:id', authenticateToken, validateRole(['ADMIN', 'SHOP_OWNER']), getProductById);

// Route to get products by seller ID
router.get('/seller/:sellerId', authenticateToken, validateRole(['SHOP_OWNER','ADMIN']), getProductsBySellerId);

// Update a product (restricted to the product owner)
router.put(
  '/:id',
  authenticateToken,
  validateRole(['SHOP_OWNER','ADMIN',]),
  upload.fields([{ name: 'imageFile' }]),
  handleImageUpload,
  updateProduct
);

// Delete a product (restricted to the product owner)
router.delete('/:id', authenticateToken, validateRole(['SHOP_OWNER','ADMIN',]), deleteProduct);

module.exports = router;
