import api from "./axios";

export const getuser = async (id) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

