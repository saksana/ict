const db = require("../config/db");

// 1. ດຶງຂໍ້ມູນໝວດໝູ່ທັງໝົດ (ບໍ່ມີ Pagination)
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tb_category ORDER BY category_id DESC",
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

// 2. ດຶງຂໍ້ມູນໝວດໝູ່ແບບມີ Pagination & Search
exports.getCategories = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(250, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || "").trim();

    const offset = (page - 1) * limit;

    let whereColumn = "";
    let queryParams = [];

    if (search) {
      whereColumn = "WHERE category_name LIKE ?";
      queryParams.push(`%${search}%`);
    }

    // ດຶງຈຳນວນທັງໝົດ
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM tb_category ${whereColumn}`,
      queryParams,
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // ດຶງຂໍ້ມູນຕາມ Page
    const dataSql = `
      SELECT * FROM tb_category 
      ${whereColumn} 
      ORDER BY category_id DESC 
      LIMIT ? OFFSET ?
    `;

    // ເອົາ limit ແລະ offset ຕໍ່ທ້າຍ queryParams
    const [rows] = await db.query(dataSql, [
      ...queryParams,
      Number(limit),
      Number(offset),
    ]);

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

// 3. ເພີ່ມໝວດໝູ່ໃໝ່
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ໝວດໝູ່!",
      });
    }

    const [duplicate] = await db.query(
      "SELECT category_id FROM tb_category WHERE category_name = ?",
      [category_name],
    );
    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ປະເພດສິນຄ້ານີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql = "INSERT INTO tb_category (category_name) VALUES (?)";
    const [result] = await db.query(sql, [category_name.trim()]);

    res.status(201).json({
      success: true,
      message: "ເພີ່ມໝວດໝູ່ສຳເລັດ!",
      data: {
        category_id: result.insertId,
        category_name: category_name.trim(),
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ຊື່ໝວດໝູ່ນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 4. ແກ້ໄຂໝວດໝູ່
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຊື່ໝວດໝູ່!",
      });
    }

    const [duplicate] = await db.query(
      "SELECT category_id FROM tb_category WHERE category_name = ? AND category_id != ?",
      [category_name, id],
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ຊື່ປະເພດສິນຄ້ານີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql =
      "UPDATE tb_category SET category_name = ? WHERE category_id = ?";
    const [result] = await db.query(sql, [category_name.trim(), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນໝວດໝູ່ທີ່ຕ້ອງການແກ້ໄຂ",
      });
    }

    res.json({
      success: true,
      message: "ແກ້ໄຂໝວດໝູ່ສຳເລັດ!",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ຊື່ໝວດໝູ່ນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 5. ລຶບໝວດໝູ່
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM tb_category WHERE category_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນໝວດໝູ່ທີ່ຕ້ອງການລຶບ",
      });
    }

    res.json({
      success: true,
      message: "ລຶບປະເພດສິນຄ້າສຳເລັດ!",
    });
  } catch (err) {
    // ກວດສອບ Foreign Key Constraint error (ກໍລະນີມີສິນຄ້າຜູກກັບ Category ນີ້ຢູ່)
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກປະເພດສິນຄ້ານີ້ຖືກໃຊ້ງານຢູ່",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};
