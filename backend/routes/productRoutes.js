const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// API ຂາຍ/ດຶງຂໍ້ມູນສິນຄ້າໄປຂາຍ: User ແລະ Admin ໃຊ້ໄດ້
router.get('/getall', productController.getAllProducts);
router.get('/', auth.verifyToken, productController.getProducts);

// API ຈັດການສິນຄ້າ (ເພີ່ມ/ແກ້ໄຂ/ລົບ): Admin ເທົ່ານັ້ນ
// ໃຊ້ upload.single('image') ເພື່ອຮັບຮູບພາບ 1 ໃບ ຈາກ key ທີ່ຊື່ວ່າ 'image'
router.post('/', auth.verifyToken, auth.verifyAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', auth.verifyToken, auth.verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, productController.deleteProduct);

module.exports = router;