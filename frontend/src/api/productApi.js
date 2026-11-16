import api from "./axios";

// ດຶງຂໍ້ມູນສິນຄ້າ (Pagination, Search, Category Filter)
export const getProducts = async (params) => {
  const response = await api.get("/products", { params });
  return response.data;
};

// ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ (ບໍ່ມີ Pagination)
export const getAllProducts = async (params) => {
  const response = await api.get("/products/all", { params });
  return response.data;
};

// ເພີ່ມສິນຄ້າໃໝ່ (ໃຊ້ FormData ເນື່ອງຈາກມີການອັບໂຫຼດຮູບ)
export const createProduct = async (formData) => {
  const response = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ແກ້ໄຂສິນຄ້າ (ໃຊ້ FormData)
export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ລຶບສິນຄ້າ
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};