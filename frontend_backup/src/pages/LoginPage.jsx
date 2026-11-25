import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Function ສຳລັບສະຫຼັບການສະແດງຜົນ
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login ລົ້ມເຫຼວ!");
    }
  };
  // rangeTheme: {
  //     50: "#fff7ed",
  //     100: "#ffedd5",
  //     400: "#fb923c",
  //     500: "#f97316",
  //     600: "#ea580c",
  //     700: "#c2410c",
  //     },

  return (
    <>
      <div class="min-h-screen overflow-hidden bg-gradient-to-br from-[#ea580c] via-red-500 to-[#fb923c] text-slate-900 antialiased">
        <main class="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
          <section class="w-full max-w-[420px] rounded-[25px] border border-white/30 bg-white p-6 text-center shadow-soft backdrop-blur-xl p-10">
            <img
              src={logo}
              alt="Login Illustration"
              class="mx-auto mb-4 h-auto w-26 sm:w-26"
            />

            <h1 class="text-2xl font-bold tracking-normal text-[#c2410c] sm:text-[1.8rem]">
              ເຂົ້າສູ່ລະບົບ
            </h1>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບຈັດການຮ້ານຄ້າ ict shop
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              id="loginForm"
              class="mt-6 space-y-[18px]"
            >
              <div className="mb-1 ml-3 text-start">
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    * {errors.username.message}
                  </p>
                )}
              </div>
              <div class="relative text-left">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#f97316]">
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </span>
                <input
                  {...register("username", {
                    required: "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້",
                  })}
                  type="text"
                  name="username"
                  autocomplete="username"
                  placeholder="ຊື່ຜູ້ໃຊ້ ຫຼື ອີເມວ"
                  //required
                  class={`h-[52px] w-full rounded-xl border border-orange-200 bg-white/75 px-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#fb923c] focus:bg-white `}
                />
              </div>
              <div className="mb-1 ml-3 text-start">
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    * {errors.password.message}
                  </p>
                )}
              </div>
              <div class="relative text-left">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#f97316]">
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 10V8a5 5 0 0 1 10 0v2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"} // ປ່ຽນ Type ຕາມ State
                  {...register("password", { required: "ກະລຸນາປ້ອນລະຫັດຜ່ານ" })}
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  placeholder="ລະຫັດຜ່ານ"
                  //required
                  class={`h-[52px] w-full rounded-xl border border-orange-200 bg-white/75 px-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#fb923c] focus:bg-white `}
                />

                <button
                  type="button"
                  id="togglePassword"
                  class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-[#ea580c] focus:outline-none"
                  aria-label="ສະແດງລະຫັດຜ່ານ"
                  aria-pressed="false"
                  onClick={togglePassword}
                >
                  {showPassword ? (
                    <svg
                      id="eyeOpen"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                    </svg>
                  ) : (
                    <svg
                      id="eyeClosed"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m3 3 18 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                      <path
                        d="M10.7 5.2A10.6 10.6 0 0 1 12 5c6 0 9.5 7 9.5 7a17.3 17.3 0 0 1-3 4.1M6.4 6.8C3.9 8.5 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.5 4.5-1.2"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                class="cursor-pointer mt-2 h-[52px] w-full rounded-xl bg-[#ea580c] px-5 text-lg font-semibold text-white shadow-lg shadow-orange-700/25 transition hover:-translate-y-0.5 hover:bg-[#c2410c] hover:shadow-xl hover:shadow-orange-700/30 focus:outline-none"
              >
                LOGIN
              </button>
            </form>
          </section>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
