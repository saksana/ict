const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/authMiddleware");

// router.get('/',auth.verifyToken, customerController.getAllCustomers);
// router.post('/',auth.verifyToken, auth.verifyAdmin,  customerController.createCustomer);
// router.put('/:id',auth.verifyToken, auth.verifyAdmin, customerController.updateCustomer);
// router.delete('/:id',auth.verifyToken, auth.verifyAdmin,  customerController.deleteCustomer);
router.get("/", auth.verifyToken, customerController.getCustomers);
router.post("/", auth.verifyToken, customerController.createCustomer);
router.put("/:id", auth.verifyToken, customerController.updateCustomer);
router.delete("/:id", auth.verifyToken, customerController.deleteCustomer);

module.exports = router;
