import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: apiUrl,
});

// --- Request Interceptor ---
// ແນບ Token ໄປກັບທຸກ Request ອັດຕະໂນມັດ
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor ---
instance.interceptors.response.use(
  (response) => {
    // ຖ້າ Success (200-299) ໃຫ້ສົ່ງຂໍ້ມູນໄປຫາ Component ປົກກະຕິ
    return response;
  },
  (error) => {
    // ກວດສອບ Error Response
    if (error.response) {
      const status = error.response.status;

      // ຈັດການ Error 401 (Unauthorized / Token ໝົດອາຍຸ)
      // ໃຊ້ ?. (Optional Chaining) ປ້ອງກັນ error ຖ້າ error.config ເປັນ undefined
      if (status === 401) {
        const isLoginRequest = error.config?.url?.includes("/login");

        if (!isLoginRequest) {
          toast.error("ເຊດຊັນໝົດອາຍຸແລ້ວ, ກະລຸນາເຂົ້າລະບົບໃໝ່");
          localStorage.removeItem("token"); // ລຶບ Token ທີ່ໝົດອາຍຸອອກ
          
          setTimeout(() => {
            window.location.href = "/login"; // ສົ່ງ User ກັບໄປໜ້າ Login
          }, 1000);
        }
      }

      // ຈັດການ Error 429 (Too Many Requests / Rate Limit)
      if (status === 429) {
        toast.error("ທ່ານສົ່ງຄຳຂໍ (Request) ຫຼາຍເກີນໄປ, ກະລຸນາລໍຖ້າ ແລ້ວລອງໃໝ່");
      }
    }

    // ສົ່ງ Error ຕໍ່ໄປໃຫ້ Component ຈັດການ (.catch)
    return Promise.reject(error);
  }
);

export default instance;