import api from "./axios";

// ດຶງປະຫວັດການເຄື່ອນໄຫວ Stock ທັງໝົດ
export const getStockHistory = async (params) => {
  const response = await api.get("/stock/history", { params });
  return response.data;
};

// ບັນທຶກນຳເຂົ້າ Stock (ຖ້າ Backend ໃຊ້ Route ນີ້)
// export const createStockIn = async (data) => {
//   const response = await api.post("/stock/in", data);
//   return response.data;
// };