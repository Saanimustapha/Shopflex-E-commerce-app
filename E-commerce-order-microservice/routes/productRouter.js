const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, search } = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const validateRole = require('../middleware/validateRole');


// Get all products
router.get('/', authenticateToken, validateRole(['USER','SHOP_OWNER']), getAllProducts);

router.get('/search', authenticateToken, validateRole(['USER','SHOP_OWNER']), search);

// Get product by ID
router.get('/:id', authenticateToken, validateRole(['USER','SHOP_OWNER','ADMIN']), getProductById);

module.exports = router;


