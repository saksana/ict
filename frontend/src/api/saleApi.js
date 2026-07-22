import api from './axios';

export const createOrder = (orderData) => api.post('/orders', orderData);
export const getCustomers = () => api.get('/customers'); // ສົມມຸດວ່າມີ API ນີ້ແລ້ວ