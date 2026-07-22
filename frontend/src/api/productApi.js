import api from './axios';

//export const getProducts = (search = '') => api.get(`/products?search=${search}`);
export const getProducts = (params) => api.get('/products', { params });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const createProduct = (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});