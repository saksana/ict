import api from './axios';

// ສ້າງອິນວອຍ / ສັ່ງຊື້ສິນຄ້າ
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// ດຶງຂໍ້ມູນລູກຄ້າ
export const getCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};