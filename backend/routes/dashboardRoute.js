const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth.verifyToken, auth.verifyAdmin, dashboardController.getDashboardStats);

module.exports = router;