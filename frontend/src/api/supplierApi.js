import api from "./axios";

// ດຶງຂໍ້ມູນຜູ້ສະໜອງທັງໝົດ (ບໍ່ມີ Pagination)
export const getAllSuppliers = async () => {
  const response = await api.get("/suppliers/all");
  return response.data;
};

// ດຶງຂໍ້ມູນຜູ້ສະໜອງ (ຮອງຮັບ Pagination / Search params)
export const getSuppliers = async (params) => {
  const response = await api.get("/suppliers", { params });
  return response.data;
};

// ເພີ່ມຜູ້ສະໜອງໃໝ່
export const createSupplier = async (data) => {
  const response = await api.post("/suppliers", data);
  return response.data;
};

// ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ
export const updateSupplier = async (id, data) => {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
};

// ລຶບຜູ້ສະໜອງ
export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};