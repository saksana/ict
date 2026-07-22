const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, reportController.getDashboardSummary);
router.get('/stock-movement', verifyToken, reportController.getStockMovement);
router.get('/sales-history', verifyToken, reportController.getSalesHistory);
router.get('/sales-detail/:order_id', reportController.getSalesHistoryDetail);

module.exports = router;