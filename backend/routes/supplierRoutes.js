const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/authMiddleware');

// ປົກປ້ອງທຸກ Route ດ້ວຍ JWT Token
// router.get('/',auth.verifyToken,  supplierController.getAllSuppliers);
// router.post('/',auth.verifyToken,auth.verifyAdmin,  supplierController.createSupplier);
// router.put('/:id',auth.verifyToken,auth.verifyAdmin,  supplierController.updateSupplier);
// router.delete('/:id',auth.verifyToken,auth.verifyAdmin, supplierController.deleteSupplier);

router.get('/', supplierController.getSuppliers);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;