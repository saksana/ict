const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth.verifyToken, auth.verifyAdmin, importController.importProducts);

module.exports = router;
