import api from "./axios";

// ດຶງລາຍງານຍອດຂາຍ (ຮອງຮັບ params ເຊັ່ນ: start_date, end_date, etc.)
export const getSalesReport = async (params) => {
  const response = await api.get("/reports/sales", { params });
  return response.data;
};

// ດຶງລາຍງານສິນຄ້າຂາຍດີ
export const getTopProductsReport = async () => {
  const response = await api.get("/reports/top-products");
  return response.data;
};

// ດຶງລາຍງານສິນຄ້າໃກ້ໝົດສະຕັອກ (Low Stock)
export const getLowStockReport = async () => {
  const response = await api.get("/reports/low-stock");
  return response.data;
};

// ດຶງລາຍງານປະຫວັດການນຳເຂົ້າສິນຄ້າ (Stock In)
export const getStockInReport = async () => {
  const response = await api.get("/reports/stock-in");
  return response.data;
};

// ດຶງລາຍງານສະຖິຕິລູກຄ້າ
export const getCustomerReport = async () => {
  const response = await api.get("/reports/customers");
  return response.data;
};