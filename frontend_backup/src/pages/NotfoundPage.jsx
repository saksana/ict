import React from "react";

function NotfoundPage() {
  return (
    <div class="bg-gray-50 flex items-center justify-center min-h-screen">
      <div class="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div class="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
          <h1 class="text-9xl font-bold text-orange-600 mb-4">404</h1>
          <h2 class="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
            ຂໍອະໄພ! ບໍ່ພົບໜ້າທີ່ທ່ານຕ້ອງການ
          </h2>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            ໜ້າເວັບທີ່ທ່ານກໍາລັງຊອກຫາບໍ່ມີ ເນື່ອງຈາກທ່ານບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ{" "}
            <br class="hidden md:block" />
            ຫຼື ທ່ານອາດຈະພິມ URL ບໍ່ຖືກຕ້ອງ.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="/"
              class="px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-500 transition duration-300 shadow-lg shadow-indigo-200 text-center"
            >
              ກັບຄືນໜ້າຫຼັກ
            </a>
            <a
              onClick={() => window.history.back()}
              class="cursor-pointer px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-300 text-center"
            >
              ຍ້ອນກັບ
            </a>
          </div>
        </div>

        <div class="w-full md:w-1/2 flex justify-center">
          <img
            src="https://yoast.com/app/uploads/2015/08/404_error_checking_FI.png"
            alt="404 Illustration"
            class="max-w-full h-auto w-[400px] md:w-[500px]"
          />
        </div>
      </div>
    </div>
  );
}

export default NotfoundPage;
