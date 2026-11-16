const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/authMiddleware");

router.get("/sales", auth.verifyToken, auth.verifyAdmin, reportController.getSalesReport);
router.get("/top-products", auth.verifyToken, auth.verifyAdmin, reportController.getTopProductsReport);
router.get("/low-stock", auth.verifyToken, auth.verifyAdmin, reportController.getLowStockReport);
router.get("/stock-in", auth.verifyToken, auth.verifyAdmin, reportController.getStockInReport);
router.get("/customers", auth.verifyToken, auth.verifyAdmin, reportController.getCustomerReport);

module.exports = router;