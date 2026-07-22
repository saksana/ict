const db = require('../config/db');

// 1. ດຶງຂໍ້ມູນຜູ້ສະໜອງທັງໝົດ
exports.getAllSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tb_supplier ORDER BY supplier_id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 2. ເພີ່ມຜູ້ສະໜອງໃໝ່
exports.createSupplier = async (req, res) => {
    try {
        const { supplier_name, phone, address, detail } = req.body;

        if (!supplier_name) {
            return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ຜູ້ສະໜອງ!" });
        }

        const sql = "INSERT INTO tb_supplier (supplier_name, phone, address, detail) VALUES (?, ?, ?, ?)";
        await db.query(sql, [supplier_name, phone, address, detail]);
        
        res.status(201).json({ message: "✅ ເພີ່ມຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ
exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_name, phone, address, detail } = req.body;

        const sql = `UPDATE tb_supplier SET 
            supplier_name = ?, phone = ?, address = ?, detail = ? 
            WHERE supplier_id = ?`;
            
        await db.query(sql, [supplier_name, phone, address, detail, id]);
        res.json({ message: "✅ ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 4. ລຶບຂໍ້ມູນຜູ້ສະໜອງ
exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM tb_supplier WHERE supplier_id = ?", [id]);
        res.json({ message: "✅ ລຶບຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};