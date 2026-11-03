import axios from "./axios"; // ປັບ path ໃຫ້ກົງກັບ project ຂອງທ່ານ

export const getAllSuppliers = () => axios.get("/suppliers/all");
export const getSuppliers = (params) => axios.get("/suppliers", { params });
export const createSupplier = (data) => axios.post("/suppliers", data);
export const updateSupplier = (id, data) => axios.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`/suppliers/${id}`);