const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const verifyToken = require('../middleware/authMiddleware');

// ປົກປ້ອງທຸກ Route ດ້ວຍ JWT Token
router.get('/', verifyToken, supplierController.getAllSuppliers);
router.post('/', verifyToken, supplierController.createSupplier);
router.put('/:id', verifyToken, supplierController.updateSupplier);
router.delete('/:id', verifyToken, supplierController.deleteSupplier);

module.exports = router;