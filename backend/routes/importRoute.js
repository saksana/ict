const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");

router.post("/", importController.importProducts);

module.exports = router;
