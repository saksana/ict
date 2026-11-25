import api from "./axios";

export const createOrder = (orderData) => api.post("/orders", orderData);

export const getCustomers = () => api.get("/customers");

export const getOrders = () => api.get("/orders");

export const cancelOrder = (orderId, cancelData) => api.put(`/orders/cancel/${orderId}`, cancelData);

export const payOrderDebt = async (orderId, data) => {
  return await api.post(`/orders/pay-order-debt/${orderId}`, data);
};
