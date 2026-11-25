const mysql = require("mysql2/promise");
const db = require("../config/db");

exports.getOrder = async (req, res) => {
  try {
    // 1. ดຶງຂໍ້ມູນ Orders ທັງໝົດພ້ອມ Payment Info
    const [orders] = await db.query(
      `SELECT o.*, p.method AS payment_method, p.amount_paid, p.change_amount, p.payment_status, u.fullname 
      FROM tb_order o 
      LEFT JOIN tb_payment p ON o.order_id = p.order_id 
      LEFT JOIN tb_user u ON o.user_id = u.user_id 
      ORDER BY o.order_id DESC`,
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    // ເກັບ Order IDs ທັງໝົດເພື່ອດຶງ Items ພ້ອມກັນໃນຄັ້ງດຽວ (Bulk Select) ປ້ອງກັນ N+1 Query
    const orderIds = orders.map((o) => o.order_id);

    const [allDetails] = await db.query(
      `SELECT d.*, p.product_name, p.image 
       FROM tb_order_detail d 
       LEFT JOIN tb_product p ON d.product_id = p.product_id 
       WHERE d.order_id IN (?)`,
      [orderIds],
    );

    // จัดกลุ่ม Items ຕາມ order_id ດ້ວຍ Map ເພື່ອຄວາມໄວສູງສຸດ
    const itemsMap = new Map();
    for (const item of allDetails) {
      if (!itemsMap.has(item.order_id)) {
        itemsMap.set(item.order_id, []);
      }
      itemsMap.get(item.order_id).push(item);
    }

    // ຜະສົມຂໍ້ມູນ Orders ແລະ Items ເຂົ້າກັນ
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsMap.get(order.order_id) || [],
    }));

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const {
      customer_id,
      user_id,
      total_amount,
      discount,
      net_amount,
      status,
      updated_by,
      items,
      payment_method,
      amount_paid,
      change_amount,
      payment_status,
    } = req.body;

    // 🟢 ຖ້າເລືອກຊຳລະແບບ "ຕິດໜີ້" ຕ້ອງມີ customer_id (ບໍ່ໃຫ້ເປັນລູກຄ້າທົ່ວໄປ/ค่าว่าง)
    if (payment_method === "credit" && (!customer_id || customer_id === 1)) {
      throw new Error("ກະລຸນາເລືອກລູກຄ້າກ່ອນເຮັດການຕິດໜີ້!");
    }

    const orderNo = `INV-${Date.now()}`;

    // 1. Insert ลง tb_order
    const sqlOrder = `INSERT INTO tb_order (order_no, customer_id, user_id, total_amount, discount, net_amount, status, updated_by) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [orderResult] = await conn.query(sqlOrder, [
      orderNo,
      customer_id,
      user_id,
      total_amount,
      discount,
      net_amount,
      status,
      updated_by,
    ]);
    const orderId = orderResult.insertId;

    // 2. ຈັດການລາຍການສິນຄ້າ ແລະ ຕັດ Stock
    for (let item of items) {
      const [product] = await conn.query(
        "SELECT stock_qty, product_name FROM tb_product WHERE product_id = ? FOR UPDATE",
        [item.product_id],
      );

      if (product[0].stock_qty < item.qty) {
        throw new Error(
          `ສິນຄ້າ ${product[0].product_name} ບໍ່ພໍໃນ Stock! (ຄົງເຫຼືອ: ${product[0].stock_qty})`,
        );
      }

      const sqlDetail = `INSERT INTO tb_order_detail (order_id, product_id, qty, unit_price, subtotal) 
                         VALUES (?, ?, ?, ?, ?)`;
      await conn.query(sqlDetail, [
        orderId,
        item.product_id,
        item.qty,
        item.unit_price,
        item.subtotal,
      ]);

      const sqlUpdateStock =
        "UPDATE tb_product SET stock_qty = stock_qty - ? WHERE product_id = ?";
      await conn.query(sqlUpdateStock, [item.qty, item.product_id]);

      const sqlStockLog = `INSERT INTO tb_stock_transactions 
                            (product_id, type, quantity, order_id, comment, user_id) 
                            VALUES (?, 'OUT', ?, ?, ?, ?)`;
      const comment = `ຂາຍສິນຄ້າຜ່ານບິນເລກທີ: ${orderNo}`;
      await conn.query(sqlStockLog, [
        item.product_id,
        item.qty,
        orderId,
        comment,
        user_id,
      ]);
    }

    // 3. ບັນທຶກການຊຳລະເງິນ
    const sqlPayment = `INSERT INTO tb_payment (order_id, method, amount_paid, change_amount, payment_status) 
                        VALUES (?, ?, ?, ?, ?)`;
    await conn.query(sqlPayment, [
      orderId,
      payment_method,
      amount_paid || 0,
      change_amount || 0,
      payment_status || (payment_method === "credit" ? "unpaid" : "paid"),
    ]);

    // 🟢 4. ຖ້າເປັນການຊຳລະແບບ "ຕິດໜີ້" -> ໃຫ້ບວກຍອດໜີ້ (`debt_balance`) ເຂົ້າໄປໃນ tb_customer
    if (payment_method === "credit") {
      await conn.query(
        "UPDATE tb_customer SET debt_balance = debt_balance + ? WHERE customer_id = ?",
        [net_amount, customer_id],
      );
    }

    await conn.commit();

    const [newOrderRows] = await db.query(
      `SELECT o.*, u.fullname, p.method AS payment_method, p.amount_paid, p.change_amount, p.payment_status 
       FROM tb_order o 
       LEFT JOIN tb_payment p ON o.order_id = p.order_id 
       LEFT JOIN tb_user u ON o.user_id = u.user_id
       WHERE o.order_id = ?`,
      [orderId],
    );

    res.status(201).json({
      success: true,
      message: "ການຂາຍສຳເລັດ!",
      order: newOrderRows[0],
    });
  } catch (err) {
    await conn.rollback();
    console.error("Order Transaction Error:", err);
    res.status(400).json({ message: "❌ ບໍ່ສາມາດຂາຍໄດ້", error: err.message });
  } finally {
    conn.release();
  }
};

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { user_id, cancel_reason } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. ກວດສອບ Order ແລະ ດຶງຂໍ້ມູນ customer_id, net_amount ມານຳ ເພື່ອຄິດໄລ່ເລື່ອງໜີ້
    const [existingOrder] = await conn.query(
      "SELECT o.order_no, o.status, o.customer_id, o.net_amount, p.method FROM tb_order o LEFT JOIN tb_payment p ON o.order_id = p.order_id WHERE o.order_id = ?",
      [id],
    );

    if (existingOrder.length === 0) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນ Order ທີ່ຕ້ອງການຍົກເລີກ");
    }

    if (existingOrder[0].status === "CANCELLED") {
      throw new Error("Order ນີ້ຖືກຍົກເລີກໄປກ່ອນໜ້ານີ້ແລ້ວ");
    }

    const {
      order_no: orderNo,
      customer_id,
      net_amount,
      method: paymentMethod,
    } = existingOrder[0];

    // 2. ດຶງລາຍການສິນຄ້າໃນບິນມາບວກຄືນ Stock
    const [orderItems] = await conn.query(
      "SELECT product_id, qty FROM tb_order_detail WHERE order_id = ?",
      [id],
    );

    for (let item of orderItems) {
      await conn.query(
        "UPDATE tb_product SET stock_qty = stock_qty + ? WHERE product_id = ?",
        [item.qty, item.product_id],
      );

      const sqlStockLog = `INSERT INTO tb_stock_transactions 
                            (product_id, type, quantity, order_id, comment, user_id) 
                            VALUES (?, 'IN', ?, ?, ?, ?)`;
      const comment = `ຄືນ Stock ຈາກການຍົກເລີກບິນເລກທີ: ${orderNo} ${cancel_reason ? `(ເຫດຜົນ: ${cancel_reason})` : ""}`;

      await conn.query(sqlStockLog, [
        item.product_id,
        item.qty,
        id,
        comment,
        user_id,
      ]);
    }

    // 🟢 3. ຖ້າບິນນີ້ເຄີຍ "ຕິດໜີ້" ມາກ່ອນ -> ໃຫ້ຫັກຍອດໜີ້ (`debt_balance`) ອອກຈາກ tb_customer ຄືນນຳ
    if (paymentMethod === "credit") {
      await conn.query(
        "UPDATE tb_customer SET debt_balance = GREATEST(0, debt_balance - ?) WHERE customer_id = ?",
        [net_amount, customer_id],
      );
    }

    // 4. ອັບເດດສະຖານະ Order ເປັນ CANCELLED
    await conn.query(
      "UPDATE tb_order SET status = 'CANCELLED', updated_by = ? WHERE order_id = ?",
      [user_id, id],
    );

    // 5. ອັບເດດ Payment Status ເປັນ REFUNDED
    await conn.query(
      "UPDATE tb_payment SET payment_status = 'REFUNDED' WHERE order_id = ?",
      [id],
    );

    await conn.commit();
    res.status(200).json({
      message: "✅ ຍົກເລີກບິນການຂາຍ ແລະ ຈັດການສະຕັອກ/ໜີ້ສິນສຳເລັດ!",
      order_no: orderNo,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Cancel Order Error:", err);
    res
      .status(400)
      .json({ message: "❌ ບໍ່ສາມາດຍົກເລີກບິນໄດ້", error: err.message });
  } finally {
    conn.release();
  }
};

exports.payOrderDebt = async (req, res) => {
  const { order_id } = req.params;
  const { amount_paid, user_id, payment_method, note } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const payAmount = Number(amount_paid);
    if (!payAmount || payAmount <= 0) {
      throw new Error("ກະລຸນາລະບຸຈຳນວນເງິນຊຳລະໃຫ້ຖືກຕ້ອງ");
    }

    // 1. ກວດສອບຂໍ້ມູນ Order ແລະ ຍອດເງິນຄົງຄ້າງຂອງບິນນັ້ນ
    const [orderRows] = await conn.query(
      `SELECT o.order_id, o.customer_id, o.net_amount, o.status, p.payment_status, c.customer_name, c.debt_balance 
       FROM tb_order o 
       LEFT JOIN tb_payment p ON o.order_id = p.order_id 
       LEFT JOIN tb_customer c ON o.customer_id = c.customer_id 
       WHERE o.order_id = ?`,
      [order_id],
    );

    if (orderRows.length === 0) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນບິນສັ່ງຊື້ດັ່ງກ່າວ");
    }

    const order = orderRows[0];

    if (order.payment_status === "paid") {
      throw new Error("ບິນນີ້ໄດ້ຊຳລະເງິນຄົບຖ້ວນແລ້ວ");
    }

    // ດຶງຍອດທີ່ເຄີຍຈ່າຍໄປແລ້ວຂອງບິນນີ້
    const [paidHistory] = await conn.query(
      "SELECT IFNULL(SUM(amount_paid), 0) as total_paid FROM tb_debt_payment WHERE order_id = ?",
      [order_id],
    );
    const alreadyPaid = Number(paidHistory[0].total_paid || 0);
    const netAmount = Number(order.net_amount);
    const remainingOrderDebt = netAmount - alreadyPaid;

    if (payAmount > remainingOrderDebt) {
      throw new Error(
        `ຈຳນວນເງິນຊຳລະ (${payAmount.toLocaleString()}) ຫຼາຍກວ່າຍອດໜີ້ຄົງเหลือຂອງບິນນີ້ (${remainingOrderDebt.toLocaleString()})`,
      );
    }

    // 2. ບັນທຶກປະຫວັດການຊຳລະໜີ້ລົງ tb_debt_payment
    const [payResult] = await conn.query(
      `INSERT INTO tb_debt_payment (order_id, customer_id, user_id, amount_paid, payment_method, note) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        order.customer_id,
        user_id || 1,
        payAmount,
        payment_method || "Cash",
        note || "ຊຳລະໜີ້ຕາມບິນ",
      ],
    );

    // 3. ຕັດຍອດໜີ້ລວມ (`debt_balance`) ໃນ tb_customer
    await conn.query(
      "UPDATE tb_customer SET debt_balance = GREATEST(0, debt_balance - ?) WHERE customer_id = ?",
      [payAmount, order.customer_id],
    );

    // 4. ກວດສອບວ່າຈ່າຍຄົບຕາມ net_amount ແລ້ວ ຫລື ຍັງ?
    const newTotalPaid = alreadyPaid + payAmount;
    let newPaymentStatus = "unpaid";
    let newOrderStatus = order.status;

    if (newTotalPaid >= netAmount) {
      newPaymentStatus = "paid";
      newOrderStatus = "COMPLETE";
    }

    await conn.query(
      "UPDATE tb_payment SET payment_status = ? WHERE order_id = ?",
      [newPaymentStatus, order_id],
    );

    await conn.query("UPDATE tb_order SET status = ? WHERE order_id = ?", [
      newOrderStatus,
      order_id,
    ]);

    await conn.commit();
    res.status(200).json({
      success: true,
      message: `ຊຳລະໜີ້ບິນ ${order_id} ສຳເລັດ!`,
      remaining_order_debt: netAmount - newTotalPaid,
      payment_status: newPaymentStatus,
      debt_pay_id: payResult.insertId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Pay Order Debt Error:", err);
    res.status(400).json({
      success: false,
      message: "ບໍ່ສາມາດຊຳລະໜີ້ໄດ້",
      error: err.message,
    });
  } finally {
    conn.release();
  }
};
