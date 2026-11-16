const db = require("../config/db");

exports.importProducts = async (req, res) => {
  let connection;

  try {
    // 1. ແປງ Input ໃຫ້ເປັນ Array ເພື່ອຮອງຮັບທັງ Object ດຽວ ແລະ Array
    const items = Array.isArray(req.body) ? req.body : [req.body];

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຂໍ້ມູນສິນຄ້າທີ່ຕ້ອງການນຳເຂົ້າ!",
      });
    }

    // 2. Validate ຂັ້ນພື້ນຖານຂອງທຸກ Item ກ່ອນເລີ່ມ Transaction
    const allSerialNumbers = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parsedQty = Number.parseInt(item.quantity, 10);

      if (!item.product_id) {
        return res.status(400).json({
          success: false,
          message: `ລາຍການທີ ${i + 1}: ກະລຸນາປ້ອນລະຫັດສິນຄ້າ!`,
        });
      }
      if (!item.quantity || Number.isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({
          success: false,
          message: `ລາຍການທີ ${i + 1}: ຈຳນວນຕ້ອງເປັນ 1 ຂຶ້ນໄປ!`,
        });
      }
      if (!item.user_id) {
        return res.status(400).json({
          success: false,
          message: `ລາຍການທີ ${i + 1}: ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້!`,
        });
      }

      // ເກັບ Serial Numbers ທັງໝົດໄວ້ກວດສອບພ້ອມກັນ
      if (item.serial_number) {
        const snList = Array.isArray(item.serial_number) ? item.serial_number : [item.serial_number];
        if (snList.length !== parsedQty) {
          return res.status(400).json({
            success: false,
            message: `ລາຍການທີ ${i + 1}: ຈຳນວນ Serial Number ບໍ່ສອດຄ່ອງກັບຈຳນວນສິນຄ້າ (${parsedQty} ໂຕ)!`,
          });
        }
        allSerialNumbers.push(...snList);
      }
    }

    // 3. ກວດສອບ Serial Number ວ່າມີຄ່າຊ້ຳກັນໃນ Payload ຕົວເเองບໍ
    const uniquePayloadSNs = new Set(allSerialNumbers);
    if (uniquePayloadSNs.size !== allSerialNumbers.length) {
      return res.status(400).json({
        success: false,
        message: "ມີ Serial Number ຊ້ຳກັນພາຍໃນຂໍ້ມູນທີ່ສົ່ງເຂົ້າມາ!",
      });
    }

    // 4. ເอົາ Connection ແລະ ເລີ່ມ Transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 5. ດຶງຂໍ້ມູນ User ແລະ Product ລ່ວງໜ້າ (Bulk Select) ພ້ອມ LOCK ປ້ອງກັນ Race Condition
    const userIds = [...new Set(items.map((i) => i.user_id))];
    const productIds = [...new Set(items.map((i) => i.product_id))];

    const [users] = await connection.query(
      "SELECT user_id FROM tb_user WHERE user_id IN (?)",
      [userIds]
    );
    const validUserIds = new Set(users.map((u) => u.user_id));

    for (const userId of userIds) {
      if (!validUserIds.has(userId)) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້! (User ID: ${userId})`,
        });
      }
    }

    const [products] = await connection.query(
      "SELECT product_id, serial_number, stock_qty FROM tb_product WHERE product_id IN (?) FOR UPDATE",
      [productIds]
    );
    const productMap = new Map(products.map((p) => [p.product_id, p]));

    for (const productId of productIds) {
      if (!productMap.has(productId)) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `ບໍ່ພົບຂໍ້ມູນສິນຄ້າ! (Product ID: ${productId})`,
        });
      }
    }

    // 6. ກວດສອບ Serial Numbers ໃນ Database ວ່າມີແລ້ວບໍ
    if (allSerialNumbers.length > 0) {
      const [existingSN] = await connection.query(
        "SELECT serial_no FROM tb_serial_number WHERE serial_no IN (?)",
        [allSerialNumbers]
      );
      if (existingSN.length > 0) {
        await connection.rollback();
        const duplicatedNos = existingSN.map((s) => s.serial_no).join(", ");
        return res.status(400).json({
          success: false,
          message: `Serial Number (${duplicatedNos}) ມີໃນລະບົບແລ້ວ!`,
        });
      }
    }

    const createdImportIds = [];
    const allStockTransactions = [];
    const allSerialValues = [];
    const stockUpdatesMap = new Map();

    // 7. ວົນ Loop ປະມວນຜົນສ້າງ Data Structure ສຳລັບ Bulk Operations
    for (const item of items) {
      const { product_id, quantity, comment, user_id, serial_number } = item;
      const parsedQty = Number.parseInt(quantity, 10);
      const product = productMap.get(product_id);

      let snList = serial_number || [];
      if (typeof snList === "string") {
        snList = [snList];
      }

      // ເກັບຂໍ້ມູນ Stock Transaction
      allStockTransactions.push([
        product_id,
        null,
        "IN",
        parsedQty,
        comment || "",
        user_id,
      ]);

      // ເກັບຂໍ້ມູນ Serial Numbers (ຖ້າສິນຄ້ານั้นຕ້ອງການ Serial)
      if (product.serial_number === 1 && snList.length > 0) {
        for (const sn of snList) {
          allSerialValues.push([product_id, sn, "IN_STOCK"]);
        }
      }

      // ໂຮມຈຳນວນ Stock ที่ຕ້ອງบວກເພີ່ມຕາມ product_id (ກໍລະນີສົ່ງ product_id ດຽວກันຫຼາຍແຖວ)
      const currentQty = stockUpdatesMap.get(product_id) || 0;
      stockUpdatesMap.set(product_id, currentQty + parsedQty);
    }

    // 8. ບັນທຶກ Stock Transactions (Bulk Insert)
    if (allStockTransactions.length > 0) {
      const sqlInsertStock = `INSERT INTO tb_stock_transactions 
        (product_id, order_id, type, quantity, comment, user_id) 
        VALUES ?`;

      const [importResult] = await connection.query(sqlInsertStock, [allStockTransactions]);
      
      let firstInsertId = importResult.insertId;
      for (let i = 0; i < allStockTransactions.length; i++) {
        createdImportIds.push(firstInsertId + i);
      }
    }

    // 9. ບັນທຶກ Serial Numbers (Bulk Insert)
    if (allSerialValues.length > 0) {
      const sqlSN = `INSERT INTO tb_serial_number (product_id, serial_no, status) VALUES ?`;
      await connection.query(sqlSN, [allSerialValues]);
    }

    // 10. ອັບເດດ Stock ຂອງ Product ແບບ Bulk Update (CASE ... WHEN) ເພື່ອຄວາມໄວສູງສຸດ
    const updateCases = [];
    const updateProductIds = [];

    for (const [prodId, addQty] of stockUpdatesMap.entries()) {
      updateCases.push(`WHEN product_id = ? THEN stock_qty + ?`);
      updateProductIds.push(prodId, addQty);
    }

    if (updateCases.length > 0) {
      const sqlBulkUpdateStock = `
        UPDATE tb_product 
        SET stock_qty = CASE 
          ${updateCases.join(" ")} 
          ELSE stock_qty 
        END 
        WHERE product_id IN (?)
      `;
      updateProductIds.push([...stockUpdatesMap.keys()]);
      await connection.query(sqlBulkUpdateStock, updateProductIds);
    }

    // Commit ເມື່ອທຸກລາຍການສຳເລັດ
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `ນຳເຂົ້າສິນຄ້າສຳເລັດ ${items.length} ລາຍການ!`,
      importIds: createdImportIds,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};