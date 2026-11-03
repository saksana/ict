import api from "./axios";

export const createOrder = (orderData) => api.post("/orders", orderData);

export const getCustomers = () => api.get("/customers");

export const getOrders = () => api.get("/orders");
