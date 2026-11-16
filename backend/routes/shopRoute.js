const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.verifyToken, auth.verifyAdmin, shopController.getShop);
router.put('/:id', auth.verifyToken, auth.verifyAdmin, shopController.updateShop);

module.exports = router;