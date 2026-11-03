import React from "react";

const ProductGrid = ({
  search,
  setSearch,
  categories,
  selectedCategory,
  setSelectedCategory,
  products,
  addToCart,
  onOpenOrderHistory, // 👈 Prop ສຳລັບເປີດ Modal ປະຫວັດການຂາຍ
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 h-full overflow-hidden pt-18">
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

          {/* 🟢 ປຸ່ມປະຫວັດການຂາຍ */}
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

      {/* ບໍລິເວນສະແດງ Grid ສິນຄ້າ */}
      <div className="flex-1 overflow-y-auto pr-2 pb-16 lg:pb-4 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {products.map((p) => (
          <div
            key={p.product_id}
            onClick={() => addToCart(p)}
            className="bg-white p-2 rounded-2xl shadow-sm hover:shadow-md border border-transparent hover:border-orange-500 cursor-pointer transition-all h-fit"
          >
            <div className="h-28 bg-gray-50 rounded-xl mb-2 overflow-hidden flex items-center justify-center text-gray-300">
              {p.image ? (
                <img
                  src={`http://localhost:3300/uploads/${p.image}`}
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
            <p className="text-[10px] text-gray-600">{p.barcode}</p>
            <div className="h-10 overflow-hidden">
              <p className="font-bold text-[12px]">{p.product_name}</p>
            </div>
            <p className="text-orange-600 font-bold">
              {Number(p.sale_price).toLocaleString()} ₭
            </p>
            <p className="text-[10px] text-gray-400">stock: {p.stock_qty}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;