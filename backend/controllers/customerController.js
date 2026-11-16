const db = require("../config/db");

// 1. ດຶງຂໍ້ມູນລູກຄ້າທັງໝົດ (ບໍ່ມີ Pagination)
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tb_customer ORDER BY customer_id DESC",
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

// 2. ດຶງຂໍ້ມູນລູກຄ້າແບບມີ Pagination & Search
exports.getCustomers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(250, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || "").trim();

    const offset = (page - 1) * limit;

    let whereColumn = "WHERE customer_id != 1";
    let queryParams = [];

    if (search) {
      whereColumn = "WHERE customer_name LIKE ? OR phone LIKE ?";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // ດຶງຈຳນວນທັງໝົດ
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM tb_customer ${whereColumn}`,
      queryParams,
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // ດຶງຂໍ້ມູນຕາມ Page
    let dataSql = `
    SELECT * FROM tb_customer 
    ${whereColumn}
    ORDER BY customer_id DESC 
    LIMIT ? OFFSET ?
    `;

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

// 3. ເພີ່ມລູກຄ້າໃໝ່
exports.createCustomer = async (req, res) => {
  try {
    const { customer_name, phone, address } = req.body;

    if (!customer_name || !customer_name.trim() || !phone || !phone.trim()) {
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

    const [existing] = await db.query(
      "SELECT customer_id FROM tb_customer WHERE phone = ?",
      [phone.trim()],
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql =
      "INSERT INTO tb_customer (customer_name, phone, address) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [
      customer_name.trim(),
      phone.trim(),
      address ? address.trim() : null,
    ]);

    res.status(201).json({
      success: true,
      message: "ເພີ່ມຂໍ້ມູນລູກຄ້າສຳເລັດ!",
      data: {
        customer_id: result.insertId,
        customer_name: customer_name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        points: 0,
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 4. ແກ້ໄຂຂໍ້ມູນລູກຄ້າ
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, phone, address } = req.body;

    if (!customer_name || !customer_name.trim() || !phone || !phone.trim()) {
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

    // ກວດສອບເບີໂທຊໍ້າກັບ ID ອື່ນ
    const [existing] = await db.query(
      "SELECT customer_id FROM tb_customer WHERE phone = ? AND customer_id != ?",
      [phone.trim(), id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    const sql = `UPDATE tb_customer SET 
      customer_name = ?, 
      phone = ?, 
      address = ?
      WHERE customer_id = ?`;

    const [result] = await db.query(sql, [
      customer_name.trim(),
      phone.trim(),
      address ? address.trim() : null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນລູກຄ້າທີ່ຕ້ອງການແກ້ໄຂ",
      });
    }

    res.json({
      success: true,
      message: "ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ!",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ!",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};

// 5. ລຶບຂໍ້ມູນລູກຄ້າ
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // 🟢 0. ຫ້າມລຶບ "ລູກຄ້າທົ່ວໄປ" (ID: 1) ເດັດຂາດ
    if (Number(id) === 1) {
      return res.status(400).json({
        success: false,
        message: "ບໍ່ສາມາດລຶບຂໍ້ມູນລູກຄ້າທົ່ວໄປ (General Customer) ໄດ້",
      });
    }

    // 🟢 1. ກວດສອບກ່ອນວ່າລູກຄ້ານີ້ຍັງມີຍອດໜີ້ຄ້າງຊຳລະ (`debt_balance`) อยู่ຫລືບໍ່
    const [customerRows] = await db.query(
      "SELECT customer_name, debt_balance FROM tb_customer WHERE customer_id = ?",
      [id],
    );

    if (customerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນລູກຄ້າທີ່ຕ້ອງການລຶບ",
      });
    }

    const customer = customerRows[0];
    if (Number(customer.debt_balance) > 0) {
      return res.status(400).json({
        success: false,
        message: `ບໍ່ສາມາດລຶບລູກຄ້າ "${customer.customer_name}" ได้ ເນື່ອງຈາກຍັງມີຍອດໜີ້ຄ້າງຊຳລະ ${Number(customer.debt_balance).toLocaleString()} ກີບ`,
      });
    }

    // 🟢 2. ດຳເນີນການລຶບຂໍ້ມູນ (ຖ້າไม่มีหนີ້ค้าง)
    const [result] = await db.query(
      "DELETE FROM tb_customer WHERE customer_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນລູກຄ້າที่ຕ້ອງການລຶບ",
      });
    }

    res.json({
      success: true,
      message: "ລຶບຂໍ້ມູນລູກຄ້າສຳເລັດ!",
    });
  } catch (err) {
    // ດັກກໍລະນີติด Foreign Key Constraint (ເຊັ່ນ: ມີການຜູກຕິດກັບຕາຕະລາງ tb_orders)
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message:
          "ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກຂໍ້ມູນລູກຄ້ານີ້ມີປະຫວັດການຊື້ສິນຄ້າໃນລະບົບແລ້ວ",
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ",
      error: err.message,
    });
  }
};
