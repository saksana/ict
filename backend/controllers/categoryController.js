const db = require('../config/db');

// 1. ດຶງຂໍ້ມູນໝວດໝູ່ທັງໝົດ
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tb_category ORDER BY category_id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 2. ເພີ່ມໝວດໝູ່ໃໝ່
exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        if (!category_name) return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ໝວດໝູ່!" });

        const sql = "INSERT INTO tb_category (category_name) VALUES (?)";
        await db.query(sql, [category_name]);
        res.status(201).json({ message: "✅ ເພີ່ມໝວດໝູ່ສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. ແກ້ໄຂໝວດໝູ່
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;
        
        const sql = "UPDATE tb_category SET category_name = ? WHERE category_id = ?";
        await db.query(sql, [category_name, id]);
        res.json({ message: "✅ ແກ້ໄຂໝວດໝູ່ສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 4. ລຶບໝວດໝູ່
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM tb_category WHERE category_id = ?", [id]);
        res.json({ message: "✅ ລຶບໝວດໝູ່ສຳເລັດ!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};