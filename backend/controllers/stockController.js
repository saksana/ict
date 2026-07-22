const db = require('../config/db');

exports.stockIn = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { product_id, supplier_id, quantity, reference_no, comment, user_id } = req.body;

        if (!product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "ກະລຸນາລະບຸສິນຄ້າ ແລະ ຈຳນວນທີ່ຖືກຕ້ອງ!" });
        }

        // 1. ເພີ່ມຈຳນວນ Stock ໃນ tb_product
        const sqlUpdateStock = "UPDATE tb_product SET stock_qty = stock_qty + ? WHERE product_id = ?";
        const [updateResult] = await conn.query(sqlUpdateStock, [quantity, product_id]);

        if (updateResult.affectedRows === 0) {
            throw new Error("ບໍ່ພົບລາຍການສິນຄ້ານີ້ໃນລະບົບ!");
        }

        // 2. ບັນທຶກລົງ tb_stock_transactions (type: IN)
        const sqlLog = `INSERT INTO tb_stock_transactions 
                        (product_id, supplier_id, type, quantity, reference_no, comment, user_id) 
                        VALUES (?, ?, 'IN', ?, ?, ?, ?)`;
        
        await conn.query(sqlLog, [
            product_id, 
            supplier_id || null, 
            quantity, 
            reference_no || `REC-${Date.now()}`, 
            comment || 'ນຳເຂົ້າສິນຄ້າໃໝ່', 
            user_id
        ]);

        await conn.commit();
        res.status(200).json({ success: true, message: "✅ ນຳເຂົ້າສິນຄ້າສຳເລັດ!" });

    } catch (err) {
        await conn.rollback();
        console.error("Stock In Error:", err);
        res.status(500).json({ success: false, message: "❌ ຜິດພາດ: " + err.message });
    } finally {
        conn.release();
    }
};

// ດຶງປະຫວັດການເຄື່ອນໄຫວສະຕັອກທັງໝົດ
exports.getStockHistory = async (req, res) => {
    try {
        const sql = `
            SELECT t.*, p.product_name, s.supplier_name, u.fullname as staff_name
            FROM tb_stock_transactions t
            LEFT JOIN tb_product p ON t.product_id = p.product_id
            LEFT JOIN tb_supplier s ON t.supplier_id = s.supplier_id
            LEFT JOIN tb_user u ON t.user_id = u.user_id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};