const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth.verifyToken, auth.verifyAdmin, supplierController.getSuppliers);
router.post("/", auth.verifyToken, auth.verifyAdmin, supplierController.createSupplier);
router.put("/:id", auth.verifyToken, auth.verifyAdmin, supplierController.updateSupplier);
router.delete("/:id", auth.verifyToken, auth.verifyAdmin, supplierController.deleteSupplier);

module.exports = router;
