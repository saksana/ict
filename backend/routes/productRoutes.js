const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// API ຂາຍ/ດຶງຂໍ້ມູນສິນຄ້າໄປຂາຍ: User ແລະ Admin ໃຊ້ໄດ້

//router.get('/', auth.verifyToken, productController.getProducts);
// router.get('/', auth.verifyToken, productController.getProducts);

router.get("/", auth.verifyToken, productController.getProducts);
router.get("/all", auth.verifyToken, productController.getAllProducts);
// API ຈັດການສິນຄ້າ (ເພີ່ມ/ແກ້ໄຂ/ລົບ): Admin ເທົ່ານັ້ນ
// ໃຊ້ upload.single('image') ເພື່ອຮັບຮູບພາບ 1 ໃບ ຈາກ key ທີ່ຊື່ວ່າ 'image'
router.post(
  "/",
  upload.single("image"),
  auth.verifyToken,
  productController.createProduct,
);
router.put(
  "/:id",
  upload.single("image"),
  auth.verifyToken,
  productController.updateProduct,
);
router.delete("/:id", auth.verifyToken, productController.deleteProduct);

module.exports = router;
