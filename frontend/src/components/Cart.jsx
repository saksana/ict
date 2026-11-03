import React from "react";

const Cart = ({
  cart,
  totalCartItems,
  showCartMobile,
  setShowCartMobile,
  selectedCustomerObj,
  setSelectedCustomerObj,
  customerSearch,
  setCustomerSearch,
  showCustomerDropdown,
  setShowCustomerDropdown,
  isSearching,
  filteredCustomers,
  handleOpenAddModal,
  handleOpenEditModal,
  handleDeleteCustomer,
  updateQty,
  removeFromCart,
  totalAmount,
  discount,
  setDiscount,
  netAmount,
  setShowPaymentModal,
}) => {
  return (
    <>
      {showCartMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setShowCartMobile(false)}
        />
      )}

      {/* ສ່ວນກະຕ່າສິນຄ້າ */}
      <div
        className={`
        fixed top-0 right-0 h-screen w-full sm:w-96 bg-slate-50 border-l border-gray-200/80 shadow-2xl flex flex-col overflow-hidden z-40 transition-transform duration-300
        lg:static lg:flex lg:translate-x-0
        ${showCartMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header ກະຕ່າ */}
        <div className="p-4 bg-white border-b border-gray-100 font-bold text-lg flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
              <i className="fas fa-shopping-cart text-sm"></i>
            </div>
            <span>ກະຕ່າສິນຄ້າ</span>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-black">
                {totalCartItems} ຊິ້ນ
              </span>
            )}
            <button
              onClick={() => setShowCartMobile(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* ສ່ວນຄົ້ນຫາ ແລະ ຈັດການລູກຄ້າ */}
        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
              <b>ຂໍ້ມູນລູກຄ້າ</b>
            </label>
            <button
              onClick={handleOpenAddModal}
              className="text-[11px] bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
            >
              <i className="fas fa-user-plus"></i> ລູກຄ້າໃໝ່
            </button>
          </div>

          {selectedCustomerObj ? (
            <div className="flex justify-between items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl text-sm font-bold shadow-md shadow-orange-500/10 border border-orange-400/20 animate-fade-in">
              <div className="truncate flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <div className="truncate">
                  <p className="font-bold leading-tight">
                    {selectedCustomerObj.customer_name}
                  </p>
                  <span className="text-[11px] opacity-90 font-medium block mt-0.5">
                    <i className="fas fa-phone-alt text-[10px] mr-1"></i>
                    {selectedCustomerObj.phone || "ບໍ່ມີເບີໂທ"} | ID:{" "}
                    {selectedCustomerObj.customer_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerObj(null);
                  setCustomerSearch("");
                }}
                className="bg-white/20 hover:bg-white/30 text-white w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="ຄົ້ນຫາ ຊື່ / ເບີໂທ / ລະຫັດລູກຄ້າ..."
                className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-sm transition-all text-gray-700 placeholder:text-gray-400"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
              />
              <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-xs"></i>

              {showCustomerDropdown && customerSearch && (
                <div className="absolute left-0 right-0 mt-2 border border-gray-100 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 text-sm p-1.5 backdrop-blur-xl bg-white/95">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-xs font-bold flex flex-col items-center gap-2">
                      <i className="fas fa-spinner fa-spin text-orange-500 text-lg"></i>
                      <span>ກຳລັງຄົ້ນຫາ...</span>
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.customer_id}
                        className="p-2.5 hover:bg-orange-50/60 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-150 group/item"
                      >
                        <div
                          className="flex items-center gap-2.5 flex-1"
                          onClick={() => {
                            setSelectedCustomerObj(cust);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">
                              {cust.customer_name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {cust.phone || "ບໍ່ມີເບີໂທ"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(cust);
                            }}
                            className="w-6 h-6 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg text-[10px] flex items-center justify-center transition-all"
                            title="ແກ້ໄຂ"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {cust.customer_id !== 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomer(cust.customer_id);
                              }}
                              className="w-6 h-6 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] flex items-center justify-center transition-all"
                              title="ລຶບ"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-xs font-bold flex flex-col items-center gap-1">
                      <i className="fas fa-user-slash text-lg"></i>
                      <span>ບໍ່ພົບຂໍ້ມູນລູກຄ້າ</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ລາຍການສິນຄ້າໃນກະຕ່າ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 ContentScrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400/80 gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <i className="fas fa-shopping-basket text-2xl"></i>
              </div>
              <p className="text-sm font-bold tracking-wide">ກະຕ່າວ່າງເປົ່າ</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between relative group hover:shadow-md hover:border-gray-200/60 transition-all duration-200"
              >
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="absolute top-3.5 right-3.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white w-6 h-6 rounded-lg text-[10px] flex items-center justify-center transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <div className="pr-6">
                  <p className="font-bold text-sm text-slate-800 truncate mb-3">
                    {item.product_name}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.qty - 1, item.stock_qty)
                      }
                      className="w-6 h-6 rounded-lg hover:bg-white text-gray-500 hover:text-orange-500 font-black transition-all flex items-center justify-center text-xs shadow-none hover:shadow-sm"
                    >
                      <i className="fas fa-minus text-[9px]"></i>
                    </button>
                    <span className="font-bold text-sm w-7 text-center text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.qty + 1, item.stock_qty)
                      }
                      className="w-6 h-6 rounded-lg hover:bg-white text-gray-500 hover:text-orange-500 font-black transition-all flex items-center justify-center text-xs shadow-none hover:shadow-sm"
                    >
                      <i className="fas fa-plus text-[9px]"></i>
                    </button>
                  </div>
                  <p className="font-black text-sm text-slate-800">
                    {Number(item.subtotal).toLocaleString()}{" "}
                    <span className="text-[10px] text-gray-400 font-normal">
                      ກີບ
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ສ່ວນຄິດໄລ່ເງິນ */}
        <div className="p-4 border-t border-gray-200/60 bg-white space-y-3.5 shrink-0 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 px-1">
            <span>ລວມເປັນເງິນ:</span>
            <span className="text-gray-700 text-sm font-black">
              {totalAmount.toLocaleString()} ກີບ
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 bg-gray-50/50 p-2.5 px-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <i className="fas fa-tag text-red-400 text-[10px]"></i>
              <span>ສ່ວນຫຼຸດ (ກີບ):</span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-32 p-1 text-right font-black text-red-500 outline-none bg-transparent border-b border-transparent focus:border-orange-500 text-sm transition-all placeholder:text-gray-300"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between items-end pt-1 px-1">
            <span className="font-bold text-sm text-gray-500 pb-0.5">
              ຍອດຊຳລະສຸດທິ:
            </span>
            <span className="text-2xl font-black text-orange-600 tracking-tight">
              {netAmount.toLocaleString()}{" "}
              <span className="text-xs font-bold text-orange-500">ກີບ</span>
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <i className="fas fa-wallet text-sm"></i>
            <span>ຊຳລະເງິນ</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;