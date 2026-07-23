const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware ກວດສອບ JWT Token
const verifyToken = (req, res, next) => {
  // ດຶງ Token ຈາກ Header (Authorization: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "❌ ບໍ່ພົບ Token, ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ!" });
  }

  try {
    // ກວດສອບ Token ດ້ວຍ Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ເກັບຂໍ້ມູນ User ໄວ້ໃນ Request ເພື່ອໃຊ້ຕໍ່ໃນ Controller
    req.user = decoded;

    next(); // ຜ່ານດ່ານແລ້ວໄປຫາຟັງຊັນຕໍ່ໄປ
  } catch (err) {
    // 4. ແຍກ Error ຕາມປະເພດ
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "⚠️ Token ໝົດອາຍຸແລ້ວ, ກະລຸນາ Login ໃໝ່!",
        expiredAt: err.expiredAt,
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "❌ Token ບໍ່ຖືກຕ້ອງ ຫຼື ຖືກດັດແປງ!",
      });
    } else {
      return res.status(500).json({
        message: "⚙️ ເກີດຂໍ້ຜິດພາດໃນການກວດສອບ Token",
      });
    }
  }
};

// Middleware ກວດສອບ Role Admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "ສິດທິບໍ່ພຽງພໍ! ເຂົ້າໄດ້ສະເພາະ Admin ເທົ່ານັ້ນ" });
  }
};

module.exports = {verifyToken,verifyAdmin};
