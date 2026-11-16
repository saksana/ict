import api from "./axios";

// ສ້າງອິນວອຍ / ສັ່ງຊື້ສິນຄ້າ
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// ດຶງຂໍ້ມູນລູກຄ້າ
export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

// ດຶງລາຍການອິນວອຍ / ປະຫວັດການສັ່ງຊື້ທັງໝົດ
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// ยกເລີກອິນວອຍ / ບິນສັ່ງຊື້
export const cancelOrder = async (orderId, cancelData) => {
  const response = await api.put(`/orders/cancel/${orderId}`, cancelData);
  return response.data;
};

// ຈ່າຍຊຳລະໜີ້ສິນອິນວອຍ
export const payOrderDebt = async (orderId, data) => {
  const response = await api.post(`/orders/pay-order-debt/${orderId}`, data);
  return response.data;
};