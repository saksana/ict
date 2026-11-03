import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const instance = axios.create({
  //baseURL: "http://localhost:3300/api", // URL ຂອງ Backend ເຮົາ
  baseURL: apiUrl,
});
// ແນບ Token ໄປກັບທຸກ Request ອັດຕະໂນມັດ
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 2. Response Interceptor:
 * ເມື່ອ Server ຕອບກັບມາ, ໃຫ້ກວດເບິ່ງ Status Code.
 * ຖ້າເປັນ 401 ແລະ ບໍ່ແມ່ນການ Login ຜິດ -> ໝາຍເຖິງ Session ໝົດອາຍຸ.
 */
instance.interceptors.response.use(
  (response) => {
    // ຖ້າ Success (200-299) ໃຫ້ສົ່ງຂໍ້ມູນໄປຫາ Component ປົກກະຕິ
    return response;
  },
  (error) => {
    // ກວດສອບ Error 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // ເຊັກ URL: ຖ້າ Error ເກີດຈາກ API /login ແມ່ນໃຫ້ຂ້າມໄປ (ເພື່ອໃຫ້ User ເຫັນ Error ລະຫັດຜິດ)
      const isLoginRequest = error.config.url.includes("/login");

      if (!isLoginRequest) {
        // ຖ້າມາຈາກ API ອື່ນໆ ແລ້ວຕິດ 401 ໝາຍເຖິງ Token ໝົດອາຍຸ (15 ນາທີ ທີ່ຕັ້ງໄວ້)
        alert("Session Expired: ເຊດຊັນໝົດອາຍຸແລ້ວ, ກະລຸນາເຂົ້າລະບົບໃໝ່");

        localStorage.removeItem("token"); // ລຶບ Token ທີ່ໝົດອາຍຸອອກ
        window.location.href = "/login"; // ສົ່ງ User ກັບໄປໜ້າ Login
      }
    }

    // ສົ່ງ Error ຕໍ່ໄປໃຫ້ Component ຈັດການ (ເຊັ່ນ: .catch ຢູ່ໜ້າ Login)
    return Promise.reject(error);
  },
);

export default instance;
