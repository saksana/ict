const db = require("../config/db");

// 1. ລາຍງານຍອດຂາຍ (ປະຈຳວັນ, ເດືອນ, ປີ)
exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let sql = `
      SELECT o.order_id, o.order_no, o.total_amount, o.discount, o.net_amount, o.created_at,
             c.customer_name, u.fullname as staff_name
      FROM tb_order o
      LEFT JOIN tb_customer c ON o.customer_id = c.customer_id
      LEFT JOIN tb_user u ON o.user_id = u.user_id
    `;
    let params = [];
    if (start_date && end_date) {
      sql += ` WHERE DATE(o.created_at) BETWEEN ? AND ?`;
      params = [start_date, end_date];
    }
    sql += ` ORDER BY o.created_at DESC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. ລາຍງານສິນຄ້າຂາຍດີ (Top Selling Products)
exports.getTopProductsReport = async (req, res) => {
  try {
    const sql = `
      SELECT p.product_id, p.product_name, p.barcode, 
             SUM(od.qty) as total_qty_sold, 
             SUM(od.subtotal) as total_revenue
      FROM tb_order_detail od
      JOIN tb_product p ON od.product_id = p.product_id
      GROUP BY p.product_id, p.product_name, p.barcode
      ORDER BY total_qty_sold DESC
      LIMIT 50
    `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. ລາຍງານສິນຄ້າໃກ້ໝົດสต็อก (Low Stock)
exports.getLowStockReport = async (req, res) => {
  try {
    const sql = `
      SELECT p.product_id, p.barcode, p.product_name, p.stock_qty, p.cost_price, p.sale_price, c.category_name
      FROM tb_product p
      LEFT JOIN tb_category c ON p.category_id = c.category_id
      WHERE p.stock_qty <= 5
      ORDER BY p.stock_qty ASC
    `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. ລາຍງານການນຳເຂົ້າສິນຄ້າ (Stock IN Transactions)
exports.getStockInReport = async (req, res) => {
  try {
    const sql = `
      SELECT st.stockt_id, st.quantity, st.comment, st.created_at,
             p.product_name, p.barcode, u.fullname as staff_name
      FROM tb_stock_transactions st
      JOIN tb_product p ON st.product_id = p.product_id
      LEFT JOIN tb_user u ON st.user_id = u.user_id
      WHERE st.type = 'IN'
      ORDER BY st.created_at DESC
    `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. ລາຍງານຂໍ້ມູນລູກຄ້າທີ່ຊື້ສິນຄ້າ (Customer Purchase Summary)
exports.getCustomerReport = async (req, res) => {
  try {
    const sql = `
      SELECT c.customer_id, c.customer_name, c.phone, c.address, c.points,
             COUNT(o.order_id) as total_orders,
             COALESCE(SUM(o.net_amount), 0) as total_spent
      FROM tb_customer c
      LEFT JOIN tb_order o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id, c.customer_name, c.phone, c.address, c.points
      ORDER BY total_spent DESC
    `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};