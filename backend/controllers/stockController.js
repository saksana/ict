const db = require('../config/db');

exports.stockIn = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { product_id, supplier_id, quantity, reference_no, comment, user_id } = req.body;

        const parsedQty = Number.parseInt(quantity, 10);
        if (!product_id || Number.isNaN(parsedQty) || parsedQty <= 0) {
            return res.status(400).json({ success: false, message: "ກະລຸນາລະບຸສິນຄ້າ ແລະ ຈຳນວນທີ່ຖືກຕ້ອງ (ຕ້ອງมากกว่า 0)!" });
        }

        if (!user_id) {
            return res.status(400).json({ success: false, message: "ກະລຸນາລະບຸລະຫັດຜູ້ໃຊ້ (user_id)!" });
        }

        // 1. ກວດສອບວ່າ User មានຢູ່จริงໃນລະບົບ
        const [users] = await conn.query("SELECT user_id FROM tb_user WHERE user_id = ?", [user_id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ງານໃນລະບົບ!" });
        }

        // 2. ກວດສອບວ່າ Product ມີຢູ່ຈິງ ແລະ ດຶງຂໍ້ມູນມາ LOCK ໄວ້ (FOR UPDATE) ປ้องกัน Race Condition
        const [products] = await conn.query(
            "SELECT product_id, product_name, stock_qty FROM tb_product WHERE product_id = ? FOR UPDATE",
            [product_id]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "ບໍ່ພົບລາຍການສິນຄ້ານີ້ໃນລະບົບ!" });
        }

        // 3. ເພີ່ມຈຳນວນ Stock ໃນ tb_product
        const sqlUpdateStock = "UPDATE tb_product SET stock_qty = stock_qty + ? WHERE product_id = ?";
        await conn.query(sqlUpdateStock, [parsedQty, product_id]);

        // 4. ບັນທຶກລົງ tb_stock_transactions (type: 'IN') ໂດຍຈັດລຽງ Column ໃຫ້ຊັດເຈນ
        const sqlLog = `
            INSERT INTO tb_stock_transactions 
            (product_id, supplier_id, type, quantity, reference_no, comment, user_id) 
            VALUES (?, ?, 'IN', ?, ?, ?, ?)
        `;
        
        await conn.query(sqlLog, [
            product_id, 
            supplier_id || null, 
            parsedQty, 
            reference_no || `REC-${Date.now()}`, 
            comment ? comment.trim() : 'ນຳເຂົ້າສິນຄ້າໃໝ່', 
            user_id
        ]);

        await conn.commit();
        res.status(200).json({ success: true, message: "✅ ນຳເຂົ້າສິນຄ້າສຳເລັດ!" });

    } catch (err) {
        await conn.rollback();
        console.error("Stock In Error:", err);
        res.status(500).json({ success: false, message: "❌ ເກີດຂໍ້ຜິດພາດໃນລະບົບ", error: err.message });
    } finally {
        conn.release();
    }
};

// ດຶງປະຫວັດການເຄື່ອນໄຫວສະຕັອກທັງໝົດ
exports.getStockHistory = async (req, res) => {
    try {
        const sql = `
            SELECT t.*, p.product_name, u.fullname as staff_name
            FROM tb_stock_transactions t
            LEFT JOIN tb_product p ON t.product_id = p.product_id
            LEFT JOIN tb_user u ON t.user_id = u.user_id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "ເກີດຂໍ້ຜິດພາດໃນລະບົບ", 
            error: err.message 
        });
    }
};