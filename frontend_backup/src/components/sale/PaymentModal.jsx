import React from "react";

export default function PaymentModal({
  show,
  onClose,
  netAmount,
  discount,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  changeAmount,
  handleConfirmOrder,
  selectedCustomerObj, // 🟢 ຮັບ Prop ຂໍ້ມູນລູກຄ້າເຂົ້າມາເພື່ອກວດສອບ
}) {
  if (!show) return null;

  // 🟢 เงื่อนไขตรวจสอบว่าสามารถบันทึกแบบติดหนີ້ได้หรือไม่ (ต้องเลือก Customer และไม่ใช่ "ລູກຄ້າທົ່ວໄປ" / ID 1)
  const isCreditValid =
    paymentMethod !== "credit" ||
    (selectedCustomerObj && selectedCustomerObj.customer_id !== 1);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-lao">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        <div className="p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center relative">
          <span className="text-xs uppercase tracking-wider opacity-80 block mb-1 font-bold">
            ຍອດຊຳລະສຸດທິ
          </span>
          <h2 className="text-3xl font-black tracking-tight font-mono">
            {netAmount.toLocaleString()}{" "}
            <span className="text-lg font-medium">ກີບ</span>
          </h2>
          {discount > 0 && (
            <p className="text-[11px] bg-white/20 backdrop-blur-md inline-block px-3 py-1 rounded-full mt-2 font-semibold">
              <i className="fas fa-gift mr-1"></i> ປະຢັດໄປ{" "}
              {discount.toLocaleString()} ກີບ
            </p>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
              # ຊ່ອງທາງການຊຳລະ
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cash");
                  setAmountPaid(0);
                }}
                className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "cash"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-100 text-gray-500 bg-white hover:border-gray-200"
                }`}
              >
                <i className="fas fa-money-bill-wave"></i> ເງິນສົດ
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("QR PromptPay");
                  setAmountPaid(netAmount);
                }}
                className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "QR PromptPay"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-100 text-gray-500 bg-white hover:border-gray-200"
                }`}
              >
                <i className="fas fa-qrcode"></i> ເງິນໂອນ
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("credit");
                  setAmountPaid(netAmount);
                }}
                className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "credit"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-100 text-gray-500 bg-white hover:border-gray-200"
                }`}
              >
                <i className="fas fa-user-clock"></i> ຕິດໜີ້
              </button>
            </div>
          </div>

          {paymentMethod === "cash" ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider text-center mb-1.5">
                  ຈຳນວນເງິນທີ່ຮັບມາ (ກີບ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="0"
                    className="w-full text-3xl font-black p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-800 font-mono"
                    value={
                      amountPaid ? Number(amountPaid).toLocaleString() : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      if (rawValue === "" || !isNaN(rawValue)) {
                        setAmountPaid(rawValue === "" ? 0 : Number(rawValue));
                      }
                    }}
                  />
                  {amountPaid > 0 && (
                    <button
                      onClick={() => setAmountPaid(0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-xs transition-all"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-400 pl-1">
                  ປຸ່ມລັດເພີ່ມເງິນດ່ວນ (+):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAmountPaid(netAmount)}
                    className="py-2.5 text-xs font-black bg-orange-500 text-white rounded-xl transition-all border border-orange-600 active:scale-95 shadow-sm"
                  >
                    ພໍດີ
                  </button>
                  {[10000, 50000, 100000].map((cash) => (
                    <button
                      key={cash}
                      type="button"
                      onClick={() =>
                        setAmountPaid((prev) => Number(prev) + cash)
                      }
                      className="py-2.5 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200/40 active:scale-95"
                    >
                      +{cash.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : paymentMethod === "QR PromptPay" ? (
            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto text-xl shadow-md shadow-blue-500/20">
                <i className="fas fa-mobile-alt animate-pulse"></i>
              </div>
              <p className="text-sm font-black text-blue-700">
                ກະລຸນາໃຫ້ລູກຄ້າສະແກນ QR Code
              </p>
              <p className="text-xs text-blue-500 font-medium">
                ຍອດເງິນຈະຖືກບັນທຶກເຂົ້າລະບົບອັດຕະໂນມັດ
              </p>
            </div>
          ) : (
            <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl text-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto text-xl shadow-md shadow-red-500/20">
                <i className="fas fa-user-clock animate-pulse"></i>
              </div>
              <p className="text-sm font-black text-red-700">
                ບັນທຶກເປັນລາຍການຕິດໜີ້
              </p>
              {/* 🟢 แจ້ງเตือนกรณีที่ยังไม่ได้เลือกชื่อลูกค้าจริง */}
              {!selectedCustomerObj || selectedCustomerObj.customer_id === 1 ? (
                <p className="text-xs text-red-600 font-bold bg-red-100 p-2 rounded-lg mt-1">
                  ⚠️ ກະລຸນາເລືອກລູກຄ້າ ກ່ອນເຮັດລາຍການຕິດໜີ້!
                </p>
              ) : (
                <p className="text-xs text-red-500 font-medium">
                  ຍອດຄ້າງຊຳລະຈະຖືກບັນທຶກເຂົ້າໃນປະຫວັດໜີ້ຂອງ: <strong className="text-red-700">{selectedCustomerObj.customer_name}</strong>
                </p>
              )}
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 flex justify-between items-center">
            <span className="font-bold text-sm text-slate-500">
              {paymentMethod === "cash"
                ? "ເງິນທອນ:"
                : paymentMethod === "QR PromptPay"
                  ? "ຍອດຕ້ອງໂອນ:"
                  : "ຍອດຕິດໜີ້:"}
            </span>
            <span
              className={`text-2xl font-black tracking-tight font-mono ${
                paymentMethod === "QR PromptPay"
                  ? "text-blue-600"
                  : paymentMethod === "credit"
                    ? "text-red-600"
                    : changeAmount >= 0
                      ? "text-green-600"
                      : "text-red-400"
              }`}
            >
              {paymentMethod === "cash"
                ? changeAmount >= 0
                  ? changeAmount.toLocaleString()
                  : 0
                : netAmount.toLocaleString()}{" "}
              <span className="text-xs font-bold">ກີບ</span>
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
            >
              ຍົກເລີກ
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={
                (paymentMethod === "cash" && Number(amountPaid) < netAmount) ||
                !isCreditValid // 🟢 ปิดการใช้งานปุ่มยืนยันถ้าเงื่อนไขติดหนี้ไม่ถูกต้อง
              }
              className={`flex-1 py-3.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none ${
                paymentMethod === "cash"
                  ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                  : paymentMethod === "QR PromptPay"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
              }`}
            >
              <i className="fas fa-check-circle mr-1.5"></i>
              {paymentMethod === "cash"
                ? "ຢືນຢັນການຮັບເງິນ"
                : paymentMethod === "QR PromptPay"
                  ? "ຢືນຢັນການໂອນ"
                  : "ຢືນຢັນການຕິດໜີ້"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}