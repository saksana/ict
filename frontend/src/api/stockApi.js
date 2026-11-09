import api from "./axios"; // ໃຊ້ axios instance ຫຼັກຂອງ project (ທີ່ປັບ BaseURL ແລະ Token ໄວ້ແລ້ວ)

// ດຶງປະຫວັດການເຄື່ອນໄຫວ Stock ທັງໝົດ
export const getStockHistory = () => api.get("/stock/history");

// ບັນທຶກນຳເຂົ້າ Stock (Stock IN)
export const createStockIn = (data) => api.post("/stock/in", data);