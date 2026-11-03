import api from "./axios";

export const getSalesReport = (params) => api.get("/reports/sales", { params });
export const getTopProductsReport = () => api.get("/reports/top-products");
export const getLowStockReport = () => api.get("/reports/low-stock");
export const getStockInReport = () => api.get("/reports/stock-in");
export const getCustomerReport = () => api.get("/reports/customers");