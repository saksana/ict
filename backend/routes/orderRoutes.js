const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.verifyToken, orderController.getOrder);
router.post('/', auth.verifyToken, orderController.createOrder);
router.put('/cancel/:id', auth.verifyToken, orderController.cancelOrder);
router.post('/pay-order-debt/:order_id', auth.verifyToken, orderController.payOrderDebt);

module.exports = router;