const db = require("../config/db");

exports.getOrder = async(req,res) =>{
  try {
        const [rows] = await db.query("SELECT * FROM tb_order ORDER BY order_id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}

exports.createOrder = async (req, res) => {
  // ສ້າງ Connection ແຍກອອກມາເພື່ອເຮັດ Transaction
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction(); // ເລີ່ມຕົ້ນ Transaction
    //console.log(req.body);
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
    // items ຈະເປັນ Array ຂອງສິນຄ້າ: [{product_id, qty, unit_price, subtotal}, ...]

    // 1. ສ້າງເລກທີບິນ (Order No) ແບບອັດຕະໂນມັດ (ຕົວຢ່າງ: ORD-20231027-001)
    const orderNo = `ORD-${Date.now()}`;

    // 2. Insert ລົງ tb_order
    const sqlOrder = `INSERT INTO tb_order (order_no, customer_id, user_id, total_amount, discount, net_amount, status,updated_by) 
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

    // 3. ຈັດການລາຍການສິນຄ້າ ແລະ ຕັດ Stock
    for (let item of items) {
      // ກວດສອບ Stock ກ່ອນ
      const [product] = await conn.query(
        "SELECT stock_qty, product_name FROM tb_product WHERE product_id = ?",
        [item.product_id],
      );

      if (product[0].stock_qty < item.qty) {
        throw new Error(
          `ສິນຄ້າ ${product[0].product_name} ບໍ່ພໍໃນ Stock! (ຄົງເຫຼືອ: ${product[0].stock_qty})`,
        );
      }

      // A. Insert ລົງ tb_order_detail
      const sqlDetail = `INSERT INTO tb_order_detail (order_id, product_id, qty, unit_price, subtotal) 
                               VALUES (?, ?, ?, ?, ?)`;
      await conn.query(sqlDetail, [
        orderId,
        item.product_id,
        item.qty,
        item.unit_price,
        item.subtotal,
      ]);

      // B. ຕັດ Stock ໃນ tb_product
      const sqlUpdateStock =
        "UPDATE tb_product SET stock_qty = stock_qty - ? WHERE product_id = ?";
      await conn.query(sqlUpdateStock, [item.qty, item.product_id]);

      // C. ບັນທຶກປະຫວັດການເອົາສິນຄ້າອອກ (tb_stock_transactions) **ເພີ່ມໃໝ່**
      const sqlStockLog = `INSERT INTO tb_stock_transactions 
                                (product_id, type, quantity, reference_no, comment, user_id) 
                                VALUES (?, 'OUT', ?, ?, ?, ?)`;
      const comment = `ຂາຍສິນຄ້າຜ່ານບິນເລກທີ: ${orderNo}`;
      await conn.query(sqlStockLog, [
        item.product_id,
        item.qty,
        orderNo,
        comment,
        user_id,
      ]);
    }

    // 4. ບັນທຶກການຊຳລະເງິນ
    const sqlPayment = `INSERT INTO tb_payment (order_id, method, amount_paid, change_amount, payment_status) 
                            VALUES (?, ?, ?, ?, ?)`;
    await conn.query(sqlPayment, [
      orderId,
      payment_method,
      amount_paid,
      change_amount,
      payment_status,
    ]);

    await conn.commit(); // ຖ້າທຸກຢ່າງສຳເລັດໃຫ້ຢືນຢັນການບັນທຶກ
    res.status(201).json({ message: "✅ ການຂາຍສຳເລັດ!", order_no: orderNo });
  } catch (err) {
    await conn.rollback(); // ຖ້າມີບ່ອນໃດຜິດພາດ ໃຫ້ຍົກເລີກທັງໝົດ
    console.error("Order Transaction Error:", err);
    res.status(400).json({ message: "❌ ບໍ່ສາມາດຂາຍໄດ້", error: err.message });
  } finally {
    conn.release(); // ຄືນ Connection ໃຫ້ Pool
  }
};

//
exports.cancelOrder = async (req, res) => {
  const { id } = req.params; // order_id ທີ່ຕ້ອງການຍົກເລີກ
  const { user_id, cancel_reason } = req.body; // ຮັບ user_id ຜູ້ຍົກເລີກ ແລະ ເຫດຜົນ (ຖ້າມີ)
  const conn = await db.getConnection();
  console.log(id)

  try {
    await conn.beginTransaction(); // ເລີ່ມຕົ້ນ Transaction

    // 1. ກວດສອບກ່ອນວ່າ Order ນີ້ມີຢູ່ແທ້ບໍ່ ແລະ ສະຖານະປະຈຸບັນເປັນແນວໃດ
    const [existingOrder] = await conn.query(
      "SELECT order_no, status FROM tb_order WHERE order_id = ?",
      [id],
    );

    if (existingOrder.length === 0) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນ Order ທີ່ຕ້ອງການຍົກເລີກ");
    }

    // ກວດສອບບໍ່ໃຫ້ຍົກເລີກຊ້ຳຊ້ອນ
    if (existingOrder[0].status === "CANCELLED") {
      throw new Error("Order ນີ້ຖືກຍົກເລີກໄປກ່ອນໜ້ານີ້ແລ້ວ");
    }

    const orderNo = existingOrder[0].order_no;

    // 2. ດຶງລາຍການສິນຄ້າໃນບິນນັ້ນອອກມາທັງໝົດ ເພື່ອເອົາໄປບວກຄືນ Stock
    const [orderItems] = await conn.query(
      "SELECT product_id, qty FROM tb_order_detail WHERE order_id = ?",
      [id],
    );

    for (let item of orderItems) {
      // A. ບວກ Stock ຄືນເຂົ້າໄປໃນ tb_product
      await conn.query(
        "UPDATE tb_product SET stock_qty = stock_qty + ? WHERE product_id = ?",
        [item.qty, item.product_id],
      );

      // B. ບັນທຶກປະຫວັດການຄືນ Stock (ເປັນ IN)
      const sqlStockLog = `INSERT INTO tb_stock_transactions 
                            (product_id, type, quantity, reference_no, comment, user_id) 
                            VALUES (?, 'IN', ?, ?, ?, ?)`;
      const comment = `ຄືນ Stock ຈາກການຍົກເລີກບິນເລກທີ: ${orderNo} ${cancel_reason ? `(ເຫດຜົນ: ${cancel_reason})` : ""}`;

      await conn.query(sqlStockLog, [
        item.product_id,
        item.qty,
        orderNo,
        comment,
        user_id,
      ]);
    }

    // 3. ອັບເດດສະຖານະຂອງ Order ໃຫ້ເປັນ CANCELLED
    // (ແນະນຳໃຫ້ເພີ່ມ column 'status' ໃນ tb_order ເປັນ VARCHAR ທີ່ມີ default ເປັນ 'COMPLETED' ຫຼື 'PAID')
    await conn.query(
      "UPDATE tb_order SET status = 'CANCELLED', updated_by = ? WHERE order_id = ?",
      [user_id, id],
    );

    // 4. ອັບເດດສະຖານະການຈ່າຍເງິນໃນ tb_payment ນຳ (ຖ້າມີ)
    await conn.query(
      "UPDATE tb_payment SET payment_status = 'REFUNDED' WHERE order_id = ?",
      [id],
    );

    await conn.commit(); // ຢືນຢັນການເຮັດທຸລະກຳທັງໝົດ
    res.status(200).json({
      message: "✅ ຍົກເລີກບິນການຂາຍ ແລະ ຄືນ Stock ສຳເລັດ!",
      order_no: orderNo,
    });
  } catch (err) {
    await conn.rollback(); // ຖ້າມີບ່ອນໃດຜິດພາດ ໃຫ້ຍົກເລີກທັງໝົດ
    console.error("Cancel Order Error:", err);
    res
      .status(400)
      .json({ message: "❌ ບໍ່ສາມາດຍົກເລີກບິນໄດ້", error: err.message });
  } finally {
    conn.release(); // ຄືນ Connection ໃຫ້ Pool
  }
};
