import axios from "./axios"; // ປັບ path ໃຫ້ກົງກັບ project ຂອງທ່ານ

export const getShop = () => axios.get("/shop");
export const updateShop = (id, data) => axios.put(`/shop/${id}`, data);