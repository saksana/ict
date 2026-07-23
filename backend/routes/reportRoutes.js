const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth.verifyToken, auth.verifyAdmin, reportController.getDashboardSummary);
router.get('/stock-movement', auth.verifyToken, auth.verifyAdmin, reportController.getStockMovement);
router.get('/sales-history', auth.verifyToken, auth.verifyAdmin, reportController.getSalesHistory);
router.get('/sales-detail/:order_id', auth.verifyToken, auth.verifyAdmin, reportController.getSalesHistoryDetail);

module.exports = router;