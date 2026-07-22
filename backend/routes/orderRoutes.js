const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, orderController.getOrder);
router.post('/', verifyToken, orderController.createOrder);
router.put('/cancle/:id',verifyToken,orderController.cancelOrder);

module.exports = router;