const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// 1. ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ (ບໍ່ມີ Pagination)
exports.getAllProducts = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const category_id = req.query.category_id
      ? parseInt(req.query.category_id, 10)
      : null;

    let whereConditions = [];
    let params = [];

    // 1. ເພີ່ມເງື່ອນໄຂ Search (ຄົ້ນຫາຕາມ product_name, barcode, brand_name)
    if (search) {
      whereConditions.push(
        "(p.product_name LIKE ? OR p.barcode LIKE ? OR p.brand_name LIKE ?)",
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // 2. ເພີ່ມເງື່ອນໄຂ Filter ຕາມ Category
    if (category_id) {
      whereConditions.push("p.category_id = ?");
      params.push(category_id);
    }

    // ສ້າງ WHERE Clause ແບບ Dynamic
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // 3. ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດຕາມ Filter (ບໍ່ມີ LIMIT / OFFSET)
    const sql = `
      SELECT p.*, c.category_name 
      FROM tb_product p 
      LEFT JOIN tb_category c ON p.category_id = c.category_id 
      ${whereClause} 
      ORDER BY p.product_id DESC
    `;

    const [rows] = await db.query(sql, params);

    return res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 2. ດຶງຂໍ້ມູນສິນຄ້າແບບມີ Pagination & Search
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      250,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const search = (req.query.search || "").trim();
    const category_id = req.query.category_id
      ? parseInt(req.query.category_id, 10)
      : null;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    // ເພີ່ມເງື່ອນໄຂ Search
    if (search) {
      whereConditions.push(
        "(p.product_name LIKE ? OR p.barcode LIKE ? OR p.brand_name LIKE ?)",
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // ເພີ່ມເງື່ອນໄຂ Filter ຕາມ Category
    if (category_id) {
      whereConditions.push("p.category_id = ?");
      params.push(category_id);
    }

    // ສ້າງ WHERE Clause ແບບ Dynamic
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // 1. ດຶງຈຳນວນທັງໝົດ
    const countSql = `SELECT COUNT(*) AS total FROM tb_product p ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // 2. ດຶງຂໍ້ມູນຕາມ Page (ປະກັນວ່າ limit/offset ເປັນ Integer)
    const sql = `
      SELECT p.*, c.category_name 
      FROM tb_product p 
      LEFT JOIN tb_category c ON p.category_id = c.category_id 
      ${whereClause} 
      ORDER BY p.product_id DESC 
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 3. ເພີ່ມສິນຄ້າໃໝ່
exports.createProduct = async (req, res) => {
  const image = req.file ? req.file.filename : null;
  const imagePath = req.file ? req.file.path : null;
  // const imagePath = req.file
  //   ? path.join(__dirname, "../uploads/", image)
  //   : null;

  // ຟັງຊັນລຶບຮູບເມື່ອເກີດ Error
  const deleteImage = () => {
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (e) {}
    }
  };

  try {
    const {
      barcode,
      category_id,
      brand_name,
      product_name,
      serial_number,
      cost_price,
      sale_price,
      old_price,
      detail,
      warranty,
    } = req.body;

    // ກວດສອບຂໍ້ມູນວ່າງ
    if (
      !barcode ||
      !barcode.trim() ||
      !category_id ||
      !product_name ||
      !product_name.trim()
    ) {
      deleteImage();
      return res.status(400).json({
        success: false,
        message:
          "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ: Barcode, Category ແລະ ຊື່ສິນຄ້າ ຫ້າມວ່າງ!",
      });
    }

    // ກວດສອບ Barcode ຊໍ້າ
    const [existingBarcode] = await db.query(
      "SELECT barcode FROM tb_product WHERE barcode = ?",
      [barcode.trim()],
    );
    if (existingBarcode.length > 0) {
      deleteImage();
      return res.status(400).json({
        success: false,
        message: "Barcode ນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    // 3. ກວດສອບ category_id ວ່າມີໃນລະບົບແທ້ຫຼືບໍ່
    const [existingCategory] = await db.query(
      "SELECT category_id FROM tb_category WHERE category_id = ?",
      [category_id],
    );

    if (existingCategory.length === 0) {
      deleteImage();
      return res.status(400).json({
        success: false,
        message: "ບໍ່ພົບ Category ນີ້ໃນລະບົບ!",
      });
    }

    const isSerial =
      serial_number === "true" ||
      serial_number === true ||
      serial_number === "1" ||
      serial_number === 1
        ? 1
        : 0;

    //const parseNumber = (val) => (val && !isNaN(val) ? Number(val) : 0);
    const parseNumber = (val) =>
      val !== null && val !== undefined && val !== "" && !isNaN(val)
        ? Number(val)
        : 0;

    const sql = `INSERT INTO tb_product 
      (barcode, category_id, brand_name, product_name, serial_number, cost_price, sale_price, old_price, detail, warranty, image) 
      VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      barcode.trim(),
      category_id,
      brand_name ? brand_name.trim() : null,
      product_name.trim(),
      isSerial,
      parseNumber(cost_price),
      parseNumber(sale_price),
      parseNumber(old_price),
      detail ? detail.trim() : null,
      warranty ? warranty.trim() : null,
      image,
    ]);

    res.status(201).json({
      success: true,
      message: "ເພີ່ມສິນຄ້າສຳເລັດ!",
      data: {
        product_id: result.insertId,
        barcode: barcode.trim(),
        product_name: product_name.trim(),
      },
    });
  } catch (err) {
    deleteImage();
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 4. ແກ້ໄຂສິນຄ້າ
exports.updateProduct = async (req, res) => {
  const newImagePath = req.file ? req.file.path : null;

  const deleteNewImage = () => {
    if (newImagePath && fs.existsSync(newImagePath)) {
      try {
        fs.unlinkSync(newImagePath);
      } catch (e) {}
    }
  };

  try {
    const { id } = req.params;
    const {
      barcode,
      category_id,
      brand_name,
      product_name,
      serial_number,
      cost_price,
      sale_price,
      old_price,
      detail,
      warranty,
      image, // ຮັບຄ່າ image ຈາກ req.body (ກໍລະນີສົ່ງ null/empty string ມາລຶບ)
    } = req.body;

    // 1. ກວດສອບຂໍ້ມູນສິນຄ້າໃນລະບົບ
    const [rows] = await db.query(
      "SELECT image FROM tb_product WHERE product_id = ?",
      [id],
    );
    if (rows.length === 0) {
      deleteNewImage();
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນສິນຄ້າທີ່ຕ້ອງການແກ້ໄຂ",
      });
    }

    // 2. Validation
    if (
      !barcode ||
      !barcode.trim() ||
      !category_id ||
      !product_name ||
      !product_name.trim()
    ) {
      deleteNewImage();
      return res.status(400).json({
        success: false,
        message:
          "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ: Barcode, Category ແລະ ຊື່ສິນຄ້າ ຫ້າມວ່າງ!",
      });
    }

    // 3. ກວດສອບ Barcode ຊໍ້າ
    const [duplicateBarcode] = await db.query(
      "SELECT product_id FROM tb_product WHERE barcode = ? AND product_id != ?",
      [barcode.trim(), id],
    );
    if (duplicateBarcode.length > 0) {
      deleteNewImage();
      return res.status(400).json({
        success: false,
        message: "Barcode ນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    // 4. ກວດສອບ Category
    const [existingCategory] = await db.query(
      "SELECT category_id FROM tb_category WHERE category_id = ?",
      [category_id],
    );
    if (existingCategory.length === 0) {
      deleteNewImage();
      return res.status(400).json({
        success: false,
        message: "ບໍ່ພົບ Category ນີ້ໃນລະບົບ!",
      });
    }

    // -------------------------------------------------------------
    // 5. ຈັດການເລື່ອງ Image (ລຶບ / ອັບໂຫຼດ / ໃຊ້ຮູບເກົ່າ)
    // -------------------------------------------------------------
    const oldImage = rows[0].image;
    let imageName = oldImage;

    if (req.file) {
      // ກໍລະນີທີ 1: ມີການອັບໂຫຼດຮູບໃໝ່ເຂົ້າມາ (req.file)
      imageName = req.file.filename;

      // ລຶບຮູບເກົ່າອອກຈາກ Folder
      if (oldImage) {
        const oldPath = path.join(__dirname, "../uploads/", oldImage);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
    } else if (req.body.image === "null" || req.body.image === null) {
      // ກໍລະນີທີ 2: ແນ່ໃສ່ວ່າ Frontend ສົ່ງ "null" ຫຼື null ມາເພື່ອກົດລຶບຮູບແທ້ໆ
      imageName = null;

      // ລຶບຮູບເກົ່າອອກຈາກ Folder
      if (oldImage) {
        const oldPath = path.join(__dirname, "../uploads/", oldImage);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
    }
    // ຖ້າ req.body.image ມີຄ່າເປັນຊື່ຮູບເກົ່າ ຫຼື ເປັນ undefined ມັນຈະຂ້າມໄປໃຊ້ imageName = oldImage ຄືເກົ່າ

    const isSerial =
      serial_number === "true" ||
      serial_number === true ||
      serial_number === "1" ||
      serial_number === 1
        ? 1
        : 0;

    const parseNumber = (val) =>
      val !== null && val !== undefined && val !== "" && !isNaN(val)
        ? Number(val)
        : 0;

    const sql = `UPDATE tb_product SET 
      barcode = ?, 
      category_id = ?, 
      brand_name = ?, 
      product_name = ?, 
      serial_number = ?,
      cost_price = ?, 
      sale_price = ?, 
      old_price = ?, 
      detail = ?, 
      warranty = ?, 
      image = ? 
      WHERE product_id = ?`;

    await db.query(sql, [
      barcode.trim(),
      category_id,
      brand_name ? brand_name.trim() : null,
      product_name.trim(),
      isSerial,
      parseNumber(cost_price),
      parseNumber(sale_price),
      parseNumber(old_price),
      detail ? detail.trim() : null,
      warranty ? warranty.trim() : null,
      imageName,
      id,
    ]);

    res.json({
      success: true,
      message: "ແກ້ໄຂສິນຄ້າສຳເລັດ!",
    });
  } catch (err) {
    deleteNewImage();
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 5. ລຶບສິນຄ້າ
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT image FROM tb_product WHERE product_id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນສິນຄ້າທີ່ຕ້ອງການລຶບ",
      });
    }

    const imageName = rows[0].image;

    const [result] = await db.query(
      "DELETE FROM tb_product WHERE product_id = ?",
      [id],
    );

    if (result.affectedRows > 0 && imageName) {
      const imagePath = path.join(__dirname, "../uploads/", imageName);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkErr) {
          console.error("Failed to delete product image:", unlinkErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: "ລຶບສິນຄ້າ ແລະ ຮູບພາບສຳເລັດ!",
    });
  } catch (err) {
    // ກວດສອບ Foreign Key Constraint error (ຖ້າມີຕາຕະລາງອື່ນອ້າງອີງ product_id ນີ້)
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກສິນຄ້ານີ້ຖືກໃຊ້ງານຢູ່",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};
