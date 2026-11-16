import api from "./axios";

// ໃຫ້ໃຊ້ຊື່ ແລະ Path ໃຫ້ຕົກກັບ Backend ພ້ອມ Extract .data ມາໃຫ້ຮຽບຮ້ອຍ
export const importProducts = async (data) => {
  const response = await api.post("/import", data);
  return response.data;
};