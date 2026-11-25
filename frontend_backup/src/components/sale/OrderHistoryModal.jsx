import React, { useState } from "react";

export default function OrderHistoryModal({
  show,
  onClose,
  filterDate,
  setFilterDate,
  filteredOrders,
  handlePrintExistingOrder,
  handleCancelOrder,
}) {
  if (!show) return null;

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-lao">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
              <i className="fas fa-history"></i>
            </div>
            <h3 className="text-lg">ປະຫວັດການຂາຍ</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">ເລືອກວັນທີ:</span>
            <input
              type="date"
              className="p-2 border border-gray-200 rounded-xl text-sm font-bold bg-white outline-none focus:border-orange-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <span className="text-xs font-bold text-gray-400">
            ພົບທັງໝົດ:{" "}
            <strong className="text-slate-700">{filteredOrders.length}</strong>{" "}
            ລາຍການ
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <i className="fas fa-file-invoice text-3xl"></i>
              <p className="text-sm font-bold">ບໍ່ມີປະຫວັດການຂາຍໃນວັນທີນີ້</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isCancelled = order.status === "CANCELLED";
              const isUnpaid = order.payment_status === "unpaid" || order.payment_method === "credit";

              return (
                <div
                  key={order.order_id}
                  className={`p-4 bg-white border rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    isCancelled 
                      ? "border-red-200 bg-red-50/30 opacity-75" 
                      : isUnpaid 
                        ? "border-amber-200 bg-amber-50/20" 
                        : "border-gray-100 hover:border-orange-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`font-black text-xs px-2.5 py-1 rounded-lg font-mono ${
                        isCancelled ? "bg-red-100 text-red-600 line-through" : "bg-orange-50 text-orange-600"
                      }`}>
                        {order.order_no || `#${order.order_id}`}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        <i className="far fa-clock mr-1"></i>
                        {formatDateTime(order.created_at) || order.order_date}
                      </span>

                      {/* 🟢 Badge ສະແດງສະຖານະການຈ່າຍເງິນ */}
                      {isCancelled ? (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ຍົກເລີກແລ້ວ
                        </span>
                      ) : isUnpaid ? (
                        <span className="bg-red-100 text-red-600 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <i className="fas fa-user-clock"></i> ค้างຊຳລະ (Unpaid)
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <i className="fas fa-check-circle"></i> ຊຳລະແລ້ວ (Paid)
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-800">
                      ຍອດລວມ:{" "}
                      <span className="text-orange-600 font-black font-mono">
                        {Number(
                          order.net_amount || order.total_amount,
                        ).toLocaleString()}{" "}
                        ກີບ
                      </span>
                      <span className="text-xs text-gray-400 ml-2 font-normal">
                        (ຊຳລະຜ່ານ: {order.payment_method})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isCancelled ? (
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <i className="fas fa-boxes"></i> ສະແດງສິນຄ້າ
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePrintExistingOrder(order)}
                          className="px-4 py-2 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <i className="fas fa-print"></i> ພິມບິນຄືນ
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.order_id)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <i className="fas fa-ban"></i> ຍົກເລີກບິນ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-lao">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-4 bg-slate-800 text-white font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <i className="fas fa-receipt text-orange-400"></i>
                <span>ລາຍການສິນຄ້າໃນບິນທີ່ຍົກເລີກ: {selectedOrderDetails.order_no}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-white/70 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="ป 4 max-h-[60vh] overflow-y-auto space-y-2 p-4">
              {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.product_name}</p>
                      <p className="text-gray-400">ຈຳນວນ: {item.qty} x {Number(item.unit_price).toLocaleString()} ₭</p>
                    </div>
                    <p className="font-black text-orange-600 font-mono">
                      {Number(item.subtotal).toLocaleString()} ₭
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-6 text-xs font-bold">ບໍ່ມີຂໍ້ມູນລາຍການສິນຄ້າ</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500">ຍອດລວມທັງໝົດ:</span>
              <span className="text-sm font-black text-slate-800 font-mono">
                {Number(selectedOrderDetails.net_amount || selectedOrderDetails.total_amount).toLocaleString()} ₭
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}