const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");

// ທຸກ Route ໃນນີ້ຕ້ອງຜ່ານການກວດສອບ Token
// router.get("/", auth.verifyToken, categoryController.getAllCategories);
// router.post("/", auth.verifyToken, auth.verifyAdmin, categoryController.createCategory);
// router.put("/:id", auth.verifyToken, auth.verifyAdmin, categoryController.updateCategory);
// router.delete("/:id", auth.verifyToken, auth.verifyAdmin, categoryController.deleteCategory);

router.get("/", categoryController.getCategories);
router.get("/all", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
