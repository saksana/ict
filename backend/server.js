const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();


const app = express();

// ເປີດໃຫ້ເຂົ້າເຖິງ Folder ຮູບພາບ
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 ນາທີ
  max: 1000, 
  message: {
    success: false,
    message: "ມີການສົ່ງ Request ມາຫຼາຍເກີນໄປຈາກ IP ນີ້, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ (Too many requests)",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors());
app.use(express.json()); // ອ່ານ JSON ຈາກ Body
app.use(express.urlencoded({ extended: true }));


// ທົດສອບ Route ພື້ນຖານ
app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/import", require("./routes/importRoute"));
app.use("/api/shop", require("./routes/shopRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ບໍ່ພົບ API (404 Not Found)",
  });
});

// ຕັ້ງຄ່າ Port ແລະ Start Server
const PORT = process.env.PORT || 3300; // ເພີ່ມ || 5000 ປ້ອງກັນໄວ້ໃນກໍລະນີ .env ບໍ່ມີ PORT
app.listen(PORT, () => {
  console.log(`🚀 Server starts on: http://localhost:${PORT}`);
});