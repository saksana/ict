const db = require("../config/db");

// 1. ດຶງຂໍ້ມູນຜູ້ສະໜອງທັງໝົດ (ບໍ່ມີ Pagination)
exports.getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tb_supplier ORDER BY supplier_id DESC"
    );
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

// 2. ດຶງຂໍ້ມູນຜູ້ສະໜອງແບບມີ Pagination & Search
exports.getSuppliers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(250, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || "").trim();

    const offset = (page - 1) * limit;

    let whereColumn = "";
    let queryParams = [];

    if (search) {
      whereColumn = "WHERE supplier_name LIKE ? OR phone LIKE ? OR detail LIKE ?";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // ດຶງຈຳນວນທັງໝົດ
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM tb_supplier ${whereColumn}`,
      queryParams
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // ດຶງຂໍ້ມູນຕາມ Page
    let dataSql = `
      SELECT * FROM tb_supplier 
      ${whereColumn} 
      ORDER BY supplier_id DESC 
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataSql, [...queryParams, Number(limit), Number(offset)]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: error.message,
    });
  }
};

// 3. ເພີ່ມຜູ້ສະໜອງໃໝ່
exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, phone, address, detail } = req.body;

    if (!supplier_name || !supplier_name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ!",
      });
    }

    // ກວດສອບເບີໂທລະສັບ
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບຕ້ອງເປັນໂຕເລກ ແລະ ມີຄວາມຍາວ 8 ໂຕເລກ!",
      });
    }

    // ກວດສອບຊື່ຜູ້ສະໜອງຊໍ້າ
    const [existing] = await db.query(
      "SELECT supplier_id FROM tb_supplier WHERE supplier_name = ?",
      [supplier_name.trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຜູ້ສະໜອງນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql =
      "INSERT INTO tb_supplier (supplier_name, phone, address, detail) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      supplier_name.trim(),
      phone.trim(),
      address ? address.trim() : "",
      detail ? detail.trim() : "",
    ]);

    res.status(201).json({
      success: true,
      message: "ເພີ່ມຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!",
      data: {
        supplier_id: result.insertId,
        supplier_name: supplier_name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : "",
        detail: detail ? detail.trim() : "",
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຜູ້ສະໜອງນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 4. ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, phone, address, detail } = req.body;

    if (!supplier_name || !supplier_name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ!",
      });
    }

    // ກວດສອບເບີໂທລະສັບ
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບຕ້ອງເປັນໂຕເລກ ແລະ ມີຄວາມຍາວ 8 ໂຕເລກ!",
      });
    }

    // ກວດສອບຊື່ຜູ້ສະໜອງຊໍ້າກັບ ID ອື່ນ
    const [existing] = await db.query(
      "SELECT supplier_id FROM tb_supplier WHERE supplier_name = ? AND supplier_id != ?",
      [supplier_name.trim(), id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຜູ້ສະໜອງນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql = `UPDATE tb_supplier SET 
      supplier_name = ?, 
      phone = ?, 
      address = ?, 
      detail = ? 
      WHERE supplier_id = ?`;

    const [result] = await db.query(sql, [
      supplier_name.trim(),
      phone.trim(),
      address ? address.trim() : "",
      detail ? detail.trim() : "",
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ຕ້ອງການແກ້ໄຂ",
      });
    }

    res.json({
      success: true,
      message: "ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!",
    });
    
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ຊື່ຜູ້ສະໜອງນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 5. ລຶບຂໍ້ມູນຜູ້ສະໜອງ
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM tb_supplier WHERE supplier_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ຕ້ອງການລຶບ",
      });
    }

    res.json({
      success: true,
      message: "ລຶບຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!",
    });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກຂໍ້ມູນຜູ້ສະໜອງນີ້ຖືກໃຊ້ງານຢູ່ (ມີປະຫວັດການສັ່ງຊື້/ນຳເຂົ້າ)",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};