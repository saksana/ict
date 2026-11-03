import api from "./axios";

// ໃຫ້ໃຊ້ຊື່ ແລະ Path ໃຫ້ົງກັບ Backend
export const importProducts = (data) => api.post("/import", data);