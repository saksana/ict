const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.verifyToken, orderController.getOrder);
router.post('/', auth.verifyToken, orderController.createOrder);
router.put('/cancle/:id', auth.verifyToken, orderController.cancelOrder);

module.exports = router;