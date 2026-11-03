const db = require("../config/db");

// 1. ດຶງຂໍ້ມູນຮ້ານຄ້າ (LIMIT 1)
exports.getShop = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tb_shop LIMIT 1"
    );
    res.json({
      success: true,
      data: rows[0] || null, // ສົ່ງຄ່າເປັນ object ເລີຍກໍໄດ້ ຖ້າມີແຕ່ 1 ຖັນ
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 4. ແກ້ໄຂຂໍ້ມູນຮ້ານຄ້າ
exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, phone, email, address } = req.body;

    if (!shop_name) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ຮ້ານຄ້າ!",
      });
    }

    // ກວດສອບຊື່ຮ້ານຄ້າຊ້ຳ (ຍົກເວັ້ນ ID ປັດຈຸບັນ)
    const [duplicate] = await db.query(
      "SELECT shop_id FROM tb_shop WHERE shop_name = ? AND shop_id != ?",
      [shop_name.trim(), id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຮ້ານຄ້ານີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    // 💡 ແກ້ໄຂ: เปลี่ยนຈາກ tb_category ແລະ category_id ມາເປັນ tb_shop ແລະ shop_id
    // ພ້ອມທັງປ້ອງກັນ .trim() ຕອນທີ່ຄ່າເປັນ undefined/null
    const sql = `
      UPDATE tb_shop 
      SET shop_name = ?, phone = ?, email = ?, address = ? 
      WHERE shop_id = ?
    `;
    
    const [result] = await db.query(sql, [
      shop_name ? shop_name.trim() : null,
      phone ? phone.trim() : null,
      email ? email.trim() : null,
      address ? address.trim() : null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າທີ່ຕ້ອງການແກ້ໄຂ",
      });
    }

    res.json({
      success: true,
      message: "ແກ້ໄຂຂໍ້ມູນຮ້ານຄ້າສຳເລັດ!",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຮ້ານຄ້ານີ້ມີໃນລະບົບແລ້ວ!",
      });
    }
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};