import api from "./axios"; // ປັບ path ໃຫ້ກົງກັບ project ຂອງທ່ານ

// ດຶງຂໍ້ມູນຮ້ານຄ້າ / ຕັ້ງຄ່າລະບົບຮ້ານ
export const getShop = async () => {
  const response = await api.get("/shop");
  return response.data;
};

// ແກ້ໄຂ/ອັບເດດຂໍ້ມູນຮ້ານຄ້າ
export const updateShop = async (id, data) => {
  const response = await api.put(`/shop/${id}`, data);
  return response.data;
};