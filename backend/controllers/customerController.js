const db = require('../config/db');

// 1. ດຶງຂໍ້ມູນລູກຄ້າທັງໝົດ
exports.getAllCustomers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tb_customer ORDER BY customer_id");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 2. ເພີ່ມລູກຄ້າໃໝ່
exports.createCustomer = async (req, res) => {
    try {
        const { customer_name, phone, address } = req.body;

        // Validation ເບື້ອງຕົ້ນ
        if (!customer_name || !phone) {
            return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ!" });
        }

        // ກວດສອບເບີໂທຊໍ້າ
        const [existing] = await db.query("SELECT phone FROM tb_customer WHERE phone = ?", [phone]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ!" });
        }

        const sql = "INSERT INTO tb_customer (customer_name, phone, address) VALUES (?, ?, ?)";
        await db.query(sql, [customer_name, phone, address]);
        
        res.status(201).json({ message: "✅ ເພີ່ມຂໍ້ມູນລູກຄ້າສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. ແກ້ໄຂຂໍ້ມູນລູກຄ້າ
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, phone, address, points } = req.body;
        
        const sql = `UPDATE tb_customer SET 
            customer_name = ?, phone = ?, address = ?, points = ? 
            WHERE customer_id = ?`;
            
        await db.query(sql, [customer_name, phone, address, points, id]);
        res.json({ message: "✅ ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 4. ລຶບຂໍ້ມູນລູກຄ້າ
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM tb_customer WHERE customer_id = ?", [id]);
        res.json({ message: "✅ ລຶບຂໍ້ມູນລູກຄ້າສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};