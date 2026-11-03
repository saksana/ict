const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/authMiddleware");

router.get("/sales", auth.verifyToken, reportController.getSalesReport);
router.get("/top-products", auth.verifyToken, reportController.getTopProductsReport);
router.get("/low-stock", auth.verifyToken, reportController.getLowStockReport);
router.get("/stock-in", auth.verifyToken, reportController.getStockInReport);
router.get("/customers", auth.verifyToken, reportController.getCustomerReport);

module.exports = router;