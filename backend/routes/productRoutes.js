const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ໃຊ້ upload.single('image') ເພື່ອຮັບຮູບພາບ 1 ໃບ ຈາກ key ທີ່ຊື່ວ່າ 'image'
router.post('/', verifyToken, upload.single('image'), productController.createProduct);
router.get('/getall',productController.getAllProducts);
router.get('/', verifyToken,productController.getProducts); 
router.put('/:id', verifyToken, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;