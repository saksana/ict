const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. ຍອດຂາຍລວມ ແລະ ຈຳນວນອໍເດີ້ທັງໝົດ
    const [orderStats] = await db.query(`
      SELECT 
        COUNT(order_id) as total_orders, 
        COALESCE(SUM(net_amount), 0) as total_sales 
      FROM tb_order
    `);

    // 2. ຈຳນວນສິນຄ້າທັງໝົດໃນ Stock
    const [productStats] = await db.query(`
      SELECT COUNT(product_id) as total_products FROM tb_product
    `);

    // 3. ຈຳນວນລູກຄ້າທັງໝົດ
    const [customerStats] = await db.query(`
      SELECT COUNT(customer_id) as total_customers FROM tb_customer
    `);

    // 4. ສິນຄ້າໃກ້ໝົດ (Stock <= 5)
    const [lowStock] = await db.query(`
      SELECT COUNT(product_id) as low_stock_count FROM tb_product WHERE stock_qty <= 5
    `);

    // 5. ຍອດຂາຍ 7 ວັນຫຼ້າສຸດ (ສຳລັບສະແດງ Graph/List)
    const [recentSales] = await db.query(`
      SELECT DATE(created_at) as sale_date, SUM(net_amount) as daily_sales, COUNT(order_id) as daily_orders
      FROM tb_order
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
      LIMIT 7
    `);

    res.json({
      success: true,
      data: {
        total_sales: orderStats[0].total_sales,
        total_orders: orderStats[0].total_orders,
        total_products: productStats[0].total_products,
        total_customers: customerStats[0].total_customers,
        low_stock_count: lowStock[0].low_stock_count,
        recent_sales: recentSales.reverse(), // ລຽງຈາກເກົ່າໄປໃໝ່
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};