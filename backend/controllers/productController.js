const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
  console.log(req.body);

  const image = req.file ? req.file.filename : null; // ເອົາຊື່ໄຟລ໌ຈາກ multer
  const imagePath = req.file
    ? path.join(__dirname, "../uploads/", image)
    : null;

  const deleteImage = () => {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
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
      stock_qty,
      old_price,
      detail,
    } = req.body;

    // 1. ກວດສອບຂໍ້ມູນວ່າງ (Required Fields)
    if (!barcode || !category_id || !product_name) {
      deleteImage();
      return res.status(400).json({
        message:
          "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ: Barcode, Category ແລະ ຊື່ສິນຄ້າ ຫ້າມວ່າງ!",
      });
    }

    // 2. ກວດສອບ Barcode ຊໍ້າ (Duplicate Entry)
    const [existingBarcode] = await db.query(
      "SELECT barcode FROM tb_product WHERE barcode = ?",
      [barcode]
    );
    if (existingBarcode.length > 0) {
      deleteImage();
      return res
        .status(400)
        .json({ message: "Barcode ນີ້ມີໃນລະບົບແລ້ວ, ກະລຸນາກວດສອບຄືນ!" });
    }

    // 3. ບັນທຶກລົງຖານຂໍ້ມູນ
    const sql = `INSERT INTO tb_product 
            (barcode, category_id, brand_name, product_name, serial_number, cost_price, sale_price, stock_qty, old_price, detail, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.query(sql, [
      barcode,
      category_id,
      brand_name,
      product_name,
      serial_number,
      cost_price,
      sale_price,
      stock_qty,
      old_price,
      detail,
      image,
    ]);

    res.status(201).json({ message: "✅ ເພີ່ມສິນຄ້າສຳເລັດ!" });
  } catch (err) {
    deleteImage();
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const sql = `
            SELECT p.*, c.category_name 
            FROM tb_product p 
            LEFT JOIN tb_category c ON p.category_id = c.category_id 
            ORDER BY p.product_id DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


exports.getProducts = async (req, res) => {
  try {
    // ຮັບຄ່າ query string, ກຳນົດ default ຄ່າຖ້າບໍ່ມີສົ່ງມາ
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    // ຄິດໄລ່ offset ທີ່ຈະຂ້າມແຖວໃນ database
    const offset = (page - 1) * limit;

    // ສ້າງ SQL Where condition ສຳລັບຄົ້ນຫາ
    let whereClause = "";
    let params = [];

    if (search) {
      whereClause =
        "WHERE p.product_name LIKE ? OR p.barcode LIKE ? OR p.brand_name LIKE ?";
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern];
    }

    // 1. ນັບຈຳນວນ Item ທັງໝົດຕາມ Search filter
    const countSql = `
      SELECT COUNT(*) as total 
      FROM tb_product p 
      ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // 2. ດຶງຂໍ້ມູນສິນຄ້າແບບ Limit & Offset
    const sql = `
      SELECT p.*, c.category_name 
      FROM tb_product p 
      LEFT JOIN tb_category c ON p.category_id = c.category_id 
      ${whereClause} 
      ORDER BY p.product_id DESC 
      LIMIT ? OFFSET ?`;

    const [products] = await db.query(sql, [...params, limit, offset]);

    // 3. ສົ່ງ Response ກັບໄປ
    res.json({
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
      data: products,
    });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ດຶງຂໍ້ມູນສິນຄ້າມາກວດສອບວ່າ ມີຊື່ຮູບພາບຫຼືບໍ່
    const [rows] = await db.query(
      "SELECT image FROM tb_product WHERE product_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "❌ ບໍ່ພົບສິນຄ້າທີ່ຕ້ອງການລຶບ!" });
    }

    const imageName = rows[0].image;

    // 2. ລຶບຂໍ້ມູນອອກຈາກ Database
    const [result] = await db.query(
      "DELETE FROM tb_product WHERE product_id = ?",
      [id]
    );

    // 3. ຖ້າລຶບໃນ DB ສຳເລັດ ແລະ ມີຮູບພາບ, ໃຫ້ທຳການລຶບໄຟລ໌ຮູບໃນ folder
    if (result.affectedRows > 0 && imageName) {
      const imagePath = path.join(__dirname, "../uploads/", imageName);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("🗑️ ລຶບໄຟລ໌ຮູບພາບອອກຈາກ Server ແລ້ວ!");
        } catch (unlinkErr) {
          console.error("❌ ບໍ່ສາມາດລຶບໄຟລ໌ຮູບໄດ້:", unlinkErr.message);
        }
      }
    }

    res.json({ message: "✅ ລຶບສິນຄ້າ ແລະ ຮູບພາບສຳເລັດ!" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
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
      stock_qty,
      detail,
    } = req.body;

    // 1. ກວດສອບກ່ອນວ່າສິນຄ້ານີ້ມີຢູ່ແທ້ບໍ່
    const [rows] = await db.query(
      "SELECT image FROM tb_product WHERE product_id = ?",
      [id]
    );
    if (rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ message: "❌ ບໍ່ພົບສິນຄ້າທີ່ຕ້ອງການແກ້ໄຂ!" });
    }

    // 2. ກວດສອບ Barcode ຊໍ້າກັນກັບສິນຄ້າອື່ນ (ເວັ້ນ Product ID ຂອງຕົວເອງ)
    if (barcode) {
      const [duplicateBarcode] = await db.query(
        "SELECT product_id FROM tb_product WHERE barcode = ? AND product_id != ?",
        [barcode, id]
      );

      if (duplicateBarcode.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "❌ Barcode ນີ້ມີໃນລະບົບແລ້ວ, ກະລຸນາກວດສອບຄືນ!" });
      }
    }

    const oldImage = rows[0].image;
    let imageName = oldImage; // ຕັ້ງຕົ້ນໃຫ້ເປັນຊື່ຮູບເກົ່າ

    // 3. ຖ້າມີການອັບໂຫລດຮູບໃໝ່ມາ
    if (req.file) {
      imageName = req.file.filename;

      // ລຶບຮູບເກົ່າອອກຈາກ Server (ຖ້າມີຮູບເກົ່າຢູ່)
      if (oldImage) {
        const oldPath = path.join(__dirname, "../uploads/", oldImage);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (unlinkErr) {
            console.error("❌ ບໍ່ສາມາດລຶບຮູບເກົ່າໄດ້:", unlinkErr.message);
          }
        }
      }
    }

    // 4. Update ຂໍ້ມູນລົງ Database
    const sql = `UPDATE tb_product SET 
            barcode = ?, category_id = ?, brand_name = ?, product_name = ?, serial_number = ?,
            cost_price = ?, sale_price = ?, stock_qty = ?, detail = ?, image = ? 
            WHERE product_id = ?`;

    await db.query(sql, [
      barcode,
      category_id,
      brand_name,
      product_name,
      serial_number,
      cost_price,
      sale_price,
      stock_qty,
      detail,
      imageName,
      id,
    ]);

    res.json({ message: "✅ ແກ້ໄຂຂໍ້ມູນສິນຄ້າສຳເລັດ!" });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Update Product Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
