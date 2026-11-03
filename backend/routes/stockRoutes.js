const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const auth = require('../middleware/authMiddleware');

router.post('/in', auth.verifyToken, auth.verifyAdmin, stockController.stockIn);
router.get('/history', stockController.getStockHistory);

module.exports = router;