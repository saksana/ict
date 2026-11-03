const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/authMiddleware");

// router.get('/',auth.verifyToken, customerController.getAllCustomers);
// router.post('/',auth.verifyToken, auth.verifyAdmin,  customerController.createCustomer);
// router.put('/:id',auth.verifyToken, auth.verifyAdmin, customerController.updateCustomer);
// router.delete('/:id',auth.verifyToken, auth.verifyAdmin,  customerController.deleteCustomer);
router.get("/", customerController.getCustomers);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
