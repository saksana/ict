CREATE TABLE `tb_category` (
  `category_id` int PRIMARY KEY AUTO_INCREMENT,
  `category_name` varchar(100),
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_product` (
  `product_id` int PRIMARY KEY AUTO_INCREMENT,
  `barcode` varchar(30),
  `category_id` int,
  `brand_name` varchar(50),
  `product_name` varchar(255),
  `serial_number` varchar(50),
  `cost_price` decimal(10,2),
  `sale_price` decimal(10,2),
  `stock_qty` int DEFAULT 0,
  `old_price` decimal(10,2),
  `detail` text,
  `image` varchar(255),
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_supplier` (
  `supplier_id` int PRIMARY KEY AUTO_INCREMENT,
  `supplier_name` varchar(255),
  `phone` varchar(20),
  `address` text,
  `detail` text,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_customer` (
  `customer_id` int PRIMARY KEY AUTO_INCREMENT,
  `customer_name` varchar(100),
  `phone` varchar(20) UNIQUE,
  `points` int DEFAULT 0,
  `address` text,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_user` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `fullname` varchar(255),
  `username` varchar(50) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Sale',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_stock_transactions` (
  `stockt_id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `supplier_id` int,
  `type` enum('IN','OUT','ADJUST'),
  `quantity` int,
  `comment` varchar(255),
  `user_id` int,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_order` (
  `order_id` int PRIMARY KEY AUTO_INCREMENT,
  `order_no` varchar(20),
  `customer_id` int,
  `user_id` int,
  `total_amount` decimal(10,2),
  `discount` decimal(10,2) DEFAULT 0,
  `net_amount` decimal(10,2),
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `tb_order_detail` (
  `order_item_id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `product_id` int,
  `qty` int NOT NULL,
  `unit_price` decimal(10,2),
  `subtotal` decimal(10,2)
);

CREATE TABLE `tb_payment` (
  `payment_id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `method` enum('Cash','QR PromptPay'),
  `amount_paid` decimal(10,2),
  `change_amount` decimal(10,2) DEFAULT 0,
  `payment_time` timestamp DEFAULT (now())
);

ALTER TABLE `tb_product` ADD FOREIGN KEY (`category_id`) REFERENCES `tb_category` (`category_id`);

ALTER TABLE `tb_order` ADD FOREIGN KEY (`customer_id`) REFERENCES `tb_customer` (`customer_id`);

ALTER TABLE `tb_order` ADD FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`user_id`);

ALTER TABLE `tb_order_item` ADD FOREIGN KEY (`order_id`) REFERENCES `tb_order` (`order_id`);

ALTER TABLE `tb_order_item` ADD FOREIGN KEY (`product_id`) REFERENCES `tb_product` (`product_id`);

ALTER TABLE `tb_payment` ADD FOREIGN KEY (`order_id`) REFERENCES `tb_order` (`order_id`);

ALTER TABLE `tb_stock_transactions` ADD FOREIGN KEY (`supplier_id`) REFERENCES `tb_supplier` (`supplier_id`);

ALTER TABLE `tb_stock_transactions` ADD FOREIGN KEY (`product_id`) REFERENCES `tb_product` (`product_id`);

ALTER TABLE `tb_stock_transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`user_id`);

ALTER TABLE `tb_order` ADD FOREIGN KEY (`order_no`) REFERENCES `tb_order` (`order_id`);
