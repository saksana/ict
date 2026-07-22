const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  port: process.env.DB_PORT || 3306,
};

const dbName = process.env.DB_NAME || "smart_pos_db";

// 1. ສ້າງ db ລໍຖ້າໄວ້ເລີຍ (ແຕ່ຍັງບໍ່ທັນ Connect ແທ້)
const db = mysql.createPool({
  ...dbConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  let connection;
  try {
    // 2. ກວດເຊັກ ແລະ ສ້າງ Database ກ່ອນ
    connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database "${dbName}" is ready.`);
    await connection.end();

    // 3. ລາຍຊື່ Tables ທີ່ຕ້ອງການສ້າງ
    const tables = [
      `CREATE TABLE IF NOT EXISTS tb_user (
          user_id int PRIMARY KEY AUTO_INCREMENT,
          fullname varchar(255),
          username varchar(50) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          role varchar(50) DEFAULT 'Sale',
          created_at timestamp DEFAULT (now())
      )`,
      `CREATE TABLE IF NOT EXISTS tb_category (
          category_id int PRIMARY KEY AUTO_INCREMENT,
          category_name varchar(100),
          created_at timestamp DEFAULT (now())
      )`,
      `CREATE TABLE IF NOT EXISTS tb_product (
          product_id int PRIMARY KEY AUTO_INCREMENT,
          barcode varchar(30),
          category_id int,
          brand_name varchar(50),
          product_name varchar(255),
          sale_price decimal(10,2),
          stock_qty int DEFAULT 0,
          image varchar(255),
          created_at timestamp DEFAULT (now())
      )`,
      // ... ທ່ານສາມາດເພີ່ມ Table ອື່ນໆທີ່ເຫຼືອໃສ່ບ່ອນນີ້ ...
    ];

    for (const sql of tables) {
      await db.query(sql);
    }
    console.log("✅ All tables are checked and ready!");

  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
  }
}

// ເອີ້ນໃຊ້ຟັງຊັນສ້າງ DB ແລະ Table ທັນທີ
initDatabase();

// 4. ສົ່ງ db ອອກໄປໃຫ້ API ໃຊ້ (db ມີ method .query ແນ່ນອນ)
module.exports = db;


// const mysql = require("mysql2");
// require("dotenv").config();

// // ສ້າງການເຊື່ອມຕໍ່ແບບ Pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // ແປງໃຫ້ຮອງຮັບ Promise (async/await)
// const db = pool.promise();
// // ສ້າງ Table ຜູ້ໃຊ້ (User Table) ຖ້າຍັງບໍ່ມີ
// const initDatabase = async () => {
//   try {
//     // 1. ສ້າງ Table ຜູ້ໃຊ້ (User Table)
//     const userTable = `
//             CREATE TABLE IF NOT EXISTS tb_user (
//                 user_id int PRIMARY KEY AUTO_INCREMENT,
//                 fullname varchar(255),
//                 username varchar(50) UNIQUE NOT NULL,
//                 password varchar(255) NOT NULL,
//                 role varchar(50) DEFAULT 'Sale',
//                 created_at timestamp DEFAULT (now())
//             );
//         `;
//     // 2. ສ້າງ Table ໝວດໝູ່ສິນຄ້າ (Category Table)
//     const categoryTable = `
//             CREATE TABLE IF NOT EXISTS tb_category (
//                 category_id int PRIMARY KEY AUTO_INCREMENT,
//                 category_name varchar(100),
//                 created_at timestamp DEFAULT (now())
//             );
//         `;

//     // 3. ສ້າງ Table ສິນຄ້າ (Product Table) [cite: 54]
//     const productTable = `
//             CREATE TABLE IF NOT EXISTS tb_product (
//                 product_id int PRIMARY KEY AUTO_INCREMENT,
//                 barcode varchar(30),
//                 category_id int,
//                 brand_name varchar(50),
//                 product_name varchar(255),
//                 serial_number varchar(50),
//                 cost_price decimal(10,2),
//                 sale_price decimal(10,2),
//                 stock_qty int DEFAULT 0,
//                 old_price decimal(10,2),
//                 detail text,
//                 image varchar(255),
//                 is_active boolean DEFAULT true,
//                 created_at timestamp DEFAULT (now())
//             );
//         `;
//     // 4. Table ລູກຄ້າ (ເພີ່ມໃໝ່)
//     const customerTable = `
//             CREATE TABLE IF NOT EXISTS tb_customer (
//                 customer_id int PRIMARY KEY AUTO_INCREMENT,
//                 customer_name varchar(100),
//                 phone varchar(20) UNIQUE,
//                 points int DEFAULT 0,
//                 address text,
//                 created_at timestamp DEFAULT (now())
//             );
//         `;
//     // 5. Table ຜູ້ສະໜອງ (ເພີ່ມໃໝ່)
//     const supplierTable = `
//             CREATE TABLE IF NOT EXISTS tb_supplier (
//                 supplier_id int PRIMARY KEY AUTO_INCREMENT,
//                 supplier_name varchar(255),
//                 phone varchar(20),
//                 address text,
//                 detail text,
//                 created_at timestamp DEFAULT (now())
//             );
//         `;
//     // 6. Table ການຂາຍຫຼັກ (Order Header)
//     const orderTable = `
//             CREATE TABLE IF NOT EXISTS tb_order (
//                 order_id int PRIMARY KEY AUTO_INCREMENT,
//                 order_no varchar(20),
//                 customer_id int,
//                 user_id int,
//                 total_amount decimal(10,2),
//                 discount decimal(10,2) DEFAULT 0,
//                 net_amount decimal(10,2),
//                 created_at timestamp DEFAULT (now())
//             );
//         `;

//     // 7. Table ລາຍລະອຽດການຂາຍ (Order Details)
//     const orderDetailTable = `
//             CREATE TABLE IF NOT EXISTS tb_order_detail (
//                 order_item_id int PRIMARY KEY AUTO_INCREMENT,
//                 order_id int,
//                 product_id int,
//                 qty int NOT NULL,
//                 unit_price decimal(10,2),
//                 subtotal decimal(10,2)
//             );
//         `;
//     // 8. Table ການຊຳລະເງິນ (ເພີ່ມໃໝ່)
//     const paymentTable = `
//             CREATE TABLE IF NOT EXISTS tb_payment (
//                 payment_id int PRIMARY KEY AUTO_INCREMENT,
//                 order_id int,
//                 method enum('Cash','QR PromptPay'),
//                 amount_paid decimal(10,2),
//                 change_amount decimal(10,2) DEFAULT 0,
//                 payment_time timestamp DEFAULT (now())
//             );
//         `;
//     // 9. Table ບັນທຶກການເຄື່ອນໄຫວສະຕັອກ (ເພີ່ມໃໝ່)
//     const stockTransactionTable = `
//             CREATE TABLE IF NOT EXISTS tb_stock_transactions (
//                 stockt_id int PRIMARY KEY AUTO_INCREMENT,
//                 product_id int NOT NULL,
//                 supplier_id int NULL,
//                 type enum('IN', 'OUT', 'ADJUST') NOT NULL,
//                 quantity int NOT NULL,
//                 reference_no varchar(50) NULL, -- ເພີ່ມເພື່ອອ້າງອີງເລກທີບິນ
//                 comment varchar(255),
//                 user_id int,
//                 created_at timestamp DEFAULT (now())
//             );
//         `;

//     await db.query(userTable);
//     await db.query(categoryTable);
//     await db.query(productTable);
//     await db.query(customerTable);
//     await db.query(supplierTable);
//     await db.query(orderTable);
//     await db.query(orderDetailTable);
//     await db.query(paymentTable);
//     await db.query(stockTransactionTable);
//     console.log("✅ All tables  are ready!");
//   } catch (err) {
//     console.error("❌ Error initializing database tables:", err.message);
//   }
// };
// db.getConnection()
//   .then((conn) => {
//     console.log("✅ Database Connected Successfully!");
//     initDatabase(); // ເອີ້ນໃຊ້ຟັງຊັນສ້າງ Table
//     conn.release();
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err.message);
//   });

// module.exports = db;
