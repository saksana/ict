const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/:id", auth.verifyToken, userController.getUser);

module.exports = router;
