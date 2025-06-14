const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByUserId,
  getOrdersBySeller,
  updateProductStatusInOrder,
} = require('../controllers/orderController');
const authenticateToken = require('../middleware/authMiddleware');
const validateRole = require('../middleware/validateRole');

// Create an order
router.post('/', authenticateToken, validateRole(['USER', 'SHOP_OWNER']), createOrder);

// User-specific order routes
router.get('/', authenticateToken, validateRole(['USER', 'SHOP_OWNER', 'ADMIN']), getOrders); // Get orders for the logged-in user

// Order management for Admins and Shop Owners
router.get('/all', authenticateToken, validateRole(['SHOP_OWNER', 'ADMIN']), getAllOrders); // Get all orders
router.get('/user/:userId', authenticateToken, validateRole(['ADMIN']), getOrdersByUserId); // Get all orders for a specific user

// Order operations
router.get('/:id', authenticateToken, validateRole(['USER', 'SHOP_OWNER', 'ADMIN']), getOrderById); // Get order by ID
router.put('/:id', authenticateToken, validateRole(['USER', 'SHOP_OWNER', 'ADMIN']), updateOrder); // Update an order
router.delete('/:id', authenticateToken, validateRole(['USER', 'SHOP_OWNER', 'ADMIN']), deleteOrder); // Delete an order
router.patch('/:id/status', authenticateToken, validateRole(['ADMIN', 'SHOP_OWNER']), updateOrderStatus); // Update overall order status

// Seller-specific routes
router.get('/seller/:sellerId', authenticateToken, validateRole(['SHOP_OWNER', 'ADMIN']), getOrdersBySeller); // Get orders for a seller
router.patch('/:orderId/product/:productId/status', authenticateToken, validateRole(['SHOP_OWNER', 'ADMIN']), updateProductStatusInOrder); // Update status of a product in an order

module.exports = router;
