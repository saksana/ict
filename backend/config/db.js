const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
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
      // . Table ຮ້ານຄ້າ(ເພີ່ມໃໝ່)
      `
            CREATE TABLE IF NOT EXISTS tb_shop (
                shop_id int PRIMARY KEY AUTO_INCREMENT,
                shop_name varchar(100),
                phone varchar(20) UNIQUE,
                email varchar(50) UNIQUE,
                address text,
                created_at timestamp DEFAULT (now())
            );
        `,
      `INSERT IGNORE INTO tb_shop(shop_id, shop_name, phone, email, address) VALUES ('1','ICT SOLUTIONS','02055502190','ict1992@gmail.com','ຖະໜົນດົງຈອງ, ບ້ານ ແສງສະຫວ່າງ, ເມືອງ ໄຊເສດຖາ ນະຄອນຫຼວງວຽງຈັນ');`,
      // . ສ້າງ Table ຜູ້ໃຊ້ (User Table)
      `
            CREATE TABLE IF NOT EXISTS tb_user (
                user_id int PRIMARY KEY AUTO_INCREMENT,
                fullname varchar(255),
                username varchar(50) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                role varchar(50) DEFAULT 'Sale',
                created_at timestamp DEFAULT (now())
            );
        `,
      // . ສ້າງ Table ໝວດໝູ່ສິນຄ້າ (Category Table)
      `
            CREATE TABLE IF NOT EXISTS tb_category (
                category_id int PRIMARY KEY AUTO_INCREMENT,
                category_name varchar(100) UNIQUE NOT NULL,
                created_at timestamp DEFAULT (now())
            );
        `,

      // . ສ້າງ Table ສິນຄ້າ (Product Table)
      `
            CREATE TABLE IF NOT EXISTS tb_product (
            product_id INT PRIMARY KEY AUTO_INCREMENT,
            barcode VARCHAR(30) UNIQUE,
            category_id INT,
            brand_name VARCHAR(50),
            product_name VARCHAR(255),
            serial_number BOOLEAN DEFAULT FALSE,
            cost_price DECIMAL(12,2) DEFAULT 0,
            sale_price DECIMAL(12,2) DEFAULT 0,
            stock_qty INT DEFAULT 0,
            old_price DECIMAL(12,2) DEFAULT 0,
            detail TEXT,
            warranty VARCHAR(50),
            image VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
            CONSTRAINT fk_product_category 
            FOREIGN KEY (category_id) 
            REFERENCES tb_category(category_id)
            ON DELETE RESTRICT 
            ON UPDATE CASCADE
);
        `,
      // . Table ລູກຄ້າ (ເພີ່ມໃໝ່)
      `
            CREATE TABLE IF NOT EXISTS tb_customer (
                customer_id int PRIMARY KEY AUTO_INCREMENT,
                customer_name varchar(100),
                phone varchar(20) UNIQUE,
                points int DEFAULT 0,
                address text,
                debt_balance DECIMAL(12,2) DEFAULT 0.00,
                created_at timestamp DEFAULT (now())
            );
        `,
      `INSERT IGNORE INTO tb_customer(customer_id, customer_name, phone, points, address) VALUES ('1','ລູກຄ້າທົ່ວໄປ','-','0','-');`,

      // . Table ຜູ້ສະໜອງ (ເພີ່ມໃໝ່)
      `
            CREATE TABLE IF NOT EXISTS tb_supplier (
                supplier_id int PRIMARY KEY AUTO_INCREMENT,
                supplier_name varchar(255),
                phone varchar(20) UNIQUE,
                address text,
                detail text,
                created_at timestamp DEFAULT (now())
            );
        `,
      // . Table ການຂາຍຫຼັກ (Order Header)
      `
            CREATE TABLE IF NOT EXISTS tb_order (
                order_id int PRIMARY KEY AUTO_INCREMENT,
                order_no varchar(20)UNIQUE,
                customer_id int,
                user_id int,
                total_amount DECIMAL(12,2),
                discount DECIMAL(12,2) DEFAULT 0,
                net_amount DECIMAL(12,2),
                created_at timestamp DEFAULT (now()),
                status varchar(20),
                updated_by int,

              CONSTRAINT fk_customers
              FOREIGN KEY (customer_id) 
              REFERENCES tb_customer(customer_id),

              CONSTRAINT fk_users_add
              FOREIGN KEY (user_id) 
              REFERENCES tb_user(user_id),

              CONSTRAINT fk_users_update
              FOREIGN KEY (updated_by) 
              REFERENCES tb_user(user_id)
            );
        `,

      // . Table ລາຍລະອຽດການຂາຍ (Order Details)
      `
            CREATE TABLE IF NOT EXISTS tb_order_detail (
                order_item_id int PRIMARY KEY AUTO_INCREMENT,
                order_id int,
                product_id int,
                qty int NOT NULL,
                unit_price DECIMAL(12,2),
                subtotal DECIMAL(12,2),

              CONSTRAINT fk_orders
              FOREIGN KEY (order_id) 
              REFERENCES tb_order(order_id),

              CONSTRAINT fk_products
              FOREIGN KEY (product_id) 
              REFERENCES tb_product(product_id)
            );
        `,
      // . Table ການຊຳລະເງິນ (ເພີ່ມໃໝ່)
      `
            CREATE TABLE IF NOT EXISTS tb_payment (
                payment_id int PRIMARY KEY AUTO_INCREMENT,
                order_id int,
                method enum('Cash','QR PromptPay', 'Credit'),
                amount_paid DECIMAL(12,2),
                change_amount DECIMAL(12,2) DEFAULT 0,
                payment_time timestamp DEFAULT (now()),
                payment_status varchar(10),

              CONSTRAINT fk_payment_orders
              FOREIGN KEY (order_id) 
              REFERENCES tb_order(order_id)
            );
        `,
      // . Table ບັນທຶກການເຄື່ອນໄຫວສະຕັອກ (ເພີ່ມໃໝ່)
      `
          CREATE TABLE IF NOT EXISTS tb_stock_transactions (
            stockt_id int PRIMARY KEY AUTO_INCREMENT,
            product_id int,
            order_id int DEFAULT NULL COMMENT 'ອ້າງອີງບິນຂາຍ ຖ້າແມ່ນການຕັດ stock ຈາກການຂາຍ',
            type enum('IN','OUT','ADJUST') DEFAULT NULL,
            quantity int DEFAULT NULL,
            comment varchar(255) DEFAULT NULL,
            user_id int,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_stock_products
            FOREIGN KEY (product_id) 
            REFERENCES tb_product(product_id),

            CONSTRAINT fk_stock_orders
            FOREIGN KEY (order_id) 
            REFERENCES tb_order(order_id),

            CONSTRAINT fk_user
            FOREIGN KEY (user_id) 
            REFERENCES tb_user(user_id)
          );
        `,
      // . Table ບັນທຶກການເຄື່ອນໄຫວສະຕັອກ (ເພີ່ມໃໝ່)
      `
          CREATE TABLE IF NOT EXISTS tb_serial_number (
            sn_id int PRIMARY KEY AUTO_INCREMENT,
            product_id int,
            serial_no varchar(100) NOT NULL UNIQUE,
            status enum('IN_STOCK','SOLD','RETURNED') DEFAULT 'IN_STOCK',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_product_serial
            FOREIGN KEY (product_id) 
            REFERENCES tb_product(product_id)
          );
        `,
      `
    CREATE TABLE IF NOT EXISTS tb_debt_payment (
    debt_pay_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    customer_id INT NOT NULL,
    user_id INT,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_debt_order FOREIGN KEY (order_id) REFERENCES tb_order(order_id),
    CONSTRAINT fk_debt_customer FOREIGN KEY (customer_id) REFERENCES tb_customer(customer_id),
    CONSTRAINT fk_debt_user FOREIGN KEY (user_id) REFERENCES tb_user(user_id)
    );
        `,
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
