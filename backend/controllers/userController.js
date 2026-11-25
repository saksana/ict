const db = require("../config/db");

// 1. ດຶງຂໍ້ມູນຜູ້ໃຊ້ (ບໍ່ມີ Pagination)
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT user_id,fullname,username FROM tb_user WHERE user_id = ?", [
      id,
    ]);
    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};
