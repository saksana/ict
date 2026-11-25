import api from './axios';

// export const getAllProducts = (search = '') => api.get(`/products/getall?search=${search}`);
// export const getProducts = (params) => api.get('/products', { params });
// export const deleteProduct = (id) => api.delete(`/products/${id}`);
// export const createProduct = (formData) => api.post('/products', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
// });
// export const updateProduct = (id, formData) => api.put(`/products/${id}`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
// });

// ດຶງຂໍ້ມູນສິນຄ້າ (Pagination, Search, Category Filter)
export const getProducts = (params) => api.get("/products", { params });

// ດຶງຂໍ້ມູນສິນຄ້າທັງໝົດ (ບໍ່ມີ Pagination)
export const getAllProducts = (params) => api.get("/products/all", { params });

// ເພີ່ມສິນຄ້າໃໝ່ (ໃຊ້ FormData ເນື່ອງຈາກມີການອັບໂຫຼດຮູບ)
export const createProduct = (formData) =>
  api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ແກ້ໄຂສິນຄ້າ (ໃຊ້ FormData)
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ລຶບສິນຄ້າ
export const deleteProduct = (id) => api.delete(`/products/${id}`);