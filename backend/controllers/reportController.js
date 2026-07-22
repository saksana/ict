const db = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
    try {
        // 1. ຍອດຂາຍທັງໝົດ ແລະ ກຳໄລ (ຄິດໄລ່ຈາກ ລາຄາຂາຍ - ລາຄາຕົ້ນທຶນ)
        const salesSql = `
            SELECT 
                SUM(d.subtotal) as total_sales,
                SUM(d.subtotal - (p.cost_price * d.qty)) as total_profit,
                COUNT(DISTINCT o.order_id) as total_orders
            FROM tb_order_detail d
            JOIN tb_order o ON d.order_id = o.order_id
            JOIN tb_product p ON d.product_id = p.product_id
        `;
        const [sales] = await db.query(salesSql);

        // 2. ສິນຄ້າໃກ້ໝົດ (Stock ຕ່ຳກວ່າ 10 ຊິ້ນ)
        const [lowStock] = await db.query("SELECT product_name, stock_qty FROM tb_product WHERE stock_qty <= 10 ORDER BY stock_qty ASC");

        // 3. ຍອດຂາຍແຍກຕາມວັນ (7 ວັນຫຼ້າສຸດ)
        const dailySql = `
            SELECT DATE(created_at) as date, SUM(net_amount) as daily_total
            FROM tb_order
            GROUP BY DATE(created_at)
            ORDER BY date DESC LIMIT 7
        `;
        const [dailySales] = await db.query(dailySql);

        res.json({
            summary: sales[0],
            lowStock: lowStock,
            dailyCharts: dailySales
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching dashboard", error: err.message });
    }
};

// 4. ລາຍງານການເຄື່ອນໄຫວສະຕັອກ (In/Out/Adjust)
exports.getStockMovement = async (req, res) => {
    try {
        const sql = `
            SELECT t.*, p.product_name, u.fullname as staff_name
            FROM tb_stock_transactions t
            JOIN tb_product p ON t.product_id = p.product_id
            JOIN tb_user u ON t.user_id = u.user_id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching movement", error: err.message });
    }
};

// 5. ປະຫວັດການຂາຍແບບລະອຽດ
exports.getSalesHistory = async (req, res) => {
    try {
        const sql = `
            SELECT o.*, c.customer_name, u.fullname as seller_name, p.method as payment_method
            FROM tb_order o
            LEFT JOIN tb_customer c ON o.customer_id = c.customer_id
            LEFT JOIN tb_user u ON o.user_id = u.user_id
            LEFT JOIN tb_payment p ON o.order_id = p.order_id
            ORDER BY o.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching history", error: err.message });
    }
};

// 6. ດຶງລາຍລະອຽດສິນຄ້າພາຍໃນບິນ (ສຳລັບເບິ່ງລາຍລະອຽດ ແລະ Reprint)
exports.getSalesHistoryDetail = async (req, res) => {
    const { order_id } = req.params;
    try {
        const sql = `
            SELECT d.*, p.product_name, p.unit
            FROM tb_order_detail d
            JOIN tb_product p ON d.product_id = p.product_id
            WHERE d.order_id = ?
        `;
        const [rows] = await db.query(sql, [order_id]);
        res.json({ success: true, items: rows });
    } catch (err) {
        res.status(500).json({ message: "Error fetching order details", error: err.message });
    }
};