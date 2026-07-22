const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/in', verifyToken, stockController.stockIn);
router.get('/history', verifyToken, stockController.getStockHistory);

module.exports = router;