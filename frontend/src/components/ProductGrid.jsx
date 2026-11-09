import React from "react";
import { Link } from "react-router-dom";
const imageUrl = import.meta.env.VITE_IMG_URL;

const ProductGrid = ({
  search,
  setSearch,
  categories,
  selectedCategory,
  setSelectedCategory,
  products,
  addToCart,
  onOpenOrderHistory,
  isLoading, // 👈 1. ຮັບ Prop isLoading ເຂົ້າມາ (ຖ້າໃນ SalePage ຍັງບໍ່ທันສົ່ງ ໃຫ້ເຮົາເພີ່ມສົ່ງເຂົ້າໄປນຳ)
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 h-full overflow-hidden pt-18 font-lao">
      {/* ແຖບຄົ້ນຫາ, Dropdown ປະເພດສິນຄ້າ ແລະ ປຸ່ມປະຫວັດການຂາຍ */}
      <div className="mb-6 shrink-0 flex flex-col sm:flex-row gap-3 max-w-3xl w-full mx-auto md:mx-0 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ຄົ້ນຫາສິນຄ້າທີ່ນີ້..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-gray-700 placeholder-gray-400 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 hover:bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-3 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-gray-700 text-sm font-medium cursor-pointer flex-1 sm:w-52"
          >
            <option value="">-- ທຸກປະເພດສິນຄ້າ --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenOrderHistory}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 active:scale-95"
            title="ປະຫວັດການຂາຍ"
          >
            <i className="fas fa-history text-orange-400"></i>
            <span className="hidden md:inline">ປະຫວັດການຂາຍ</span>
          </button>
        </div>
      </div>

      {/* ບໍລິເວນສະແດງຜົນ (Loading, ບໍ່ມີສິນຄ້າ, ຫຼື Grid ສິນຄ້າ) */}
      <div className="flex-1 overflow-y-auto pr-2 pb-16 lg:pb-4 flex flex-col">
        {isLoading ? (
          /* 🟢 2. ສະແດງ Loading Spinner ວົງມົນ ເວລາກຳລັງໂຫຼດຂໍ້ມູນ */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm gap-3 my-auto">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-600">
              ກຳລັງໂຫຼດລາຍການສິນຄ້າ...
            </p>
          </div>
        ) : products.length === 0 ? (
          /* 🟢 3. ສະແດງເມື່ອໂຫຼດສຳເລັດແລ້ວແຕ່ບໍ່ມີສິນຄ້າອີຫຼີ */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm gap-4 my-auto">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              <i className="fas fa-box-open"></i>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                {search || selectedCategory
                  ? "ບໍ່ພົບສິນຄ້າ"
                  : "ຍັງບໍ່ມີລາຍການສິນຄ້າ"}
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {search || selectedCategory
                  ? "ບໍ່ພົບສິນຄ້າທີ່ກົງກັບຄຳຄົ້ນຫາຂອງທ່ານ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ"
                  : "ເລີ່ມຕົ້ນເພີ່ມລາຍການສິນຄ້າທຳອິດຂອງທ່ານເພື່ອຂາຍຜ່ານລະບົບ POS"}
              </p>
            </div>

            <Link
              to="/products"
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>ໄປໜ້າເພີ່ມສິນຄ້າ</span>
            </Link>
          </div>
        ) : (
          /* 🟢 4. ສະແດງ Grid ສິນຄ້າປົກກະຕິ */
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {products.map((p) => {
              const isOutOfStock = Number(p.stock_qty) <= 0;

              return (
                <div
                  key={p.product_id}
                  onClick={() => {
                    if (!isOutOfStock) {
                      addToCart(p);
                    }
                  }}
                  className={`bg-white p-2 rounded-2xl shadow-sm border transition-all h-fit relative overflow-hidden ${
                    isOutOfStock
                      ? "opacity-90 cursor-not-allowed border-transparent"
                      : "hover:shadow-md border-transparent hover:border-orange-500 cursor-pointer"
                  }`}
                >
                  {/* Container ຮູບພາບ */}
                  <div
                    className={`h-28 bg-gray-50 rounded-xl mb-2 overflow-hidden flex items-center justify-center text-gray-300 relative`}
                  >
                    {/* 🔴 ປ້າຍ "ສິນຄ້າໝົດ" ຢູ່ກາງຮູບພາບພໍດີ */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
                        <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-md  flex items-center gap-1.5 tracking-wider uppercase">
                          <i className="fas fa-ban text-[10px]"></i> ສິນຄ້າໝົດ
                        </span>
                      </div>
                    )}

                    {p.image ? (
                      <img
                        src={`${imageUrl}/${p.image}`}
                        className="w-full h-full object-cover"
                        alt={p.product_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML =
                            '<i className="fas fa-image text-3xl"></i>';
                        }}
                      />
                    ) : (
                      <i className="fas fa-image text-3xl text-gray-300"></i>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 font-mono">
                    {p.barcode || "-"}
                  </p>
                  <div className="h-10 overflow-hidden">
                    <p className="font-bold text-[12px] text-slate-800 leading-tight">
                      {p.product_name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-orange-600 font-bold text-xs">
                      {Number(p.sale_price).toLocaleString()} ₭
                    </p>
                    <p
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isOutOfStock
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      stock: {p.stock_qty}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
