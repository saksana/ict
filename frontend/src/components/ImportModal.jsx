import React from "react";

export default function ImportModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  importItems = [],
  products = [], // 🟢 ປ້ອງກັນກໍລະນີ products ເປັນ undefined/null ໃຫ້ເປັນ Array ວ່າງໄວ້ກ່ອນ
  handleAddItem,
  handleRemoveItem,
  handleItemChange,
  handleOpenSnModal,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-lao">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-800">ນຳເຂົ້າສິນຄ້າເຂົ້າສະຕັອກ</h3>
            <p className="text-xs text-gray-400">ເພີ່ມຈຳນວນສິນຄ້າເຂົ້າສາງ ພ້ອມກຳນົດ Serial Number</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <i className="fas fa-times text-base"></i>
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">ລາຍການສິນຄ້າທີ່ນຳເຂົ້າ</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <i className="fas fa-plus"></i> ເພີ່ມແຖວ
              </button>
            </div>

            {importItems.map((item, index) => {
              // 🟢 ປ້ອງກັນເພີ່ມເຕີມໃນກໍລະນີ products ຍັງບໍ່ມາ
              const safeProducts = Array.isArray(products) ? products : [];
              const selectedProd = safeProducts.find(
                (p) => p.product_id.toString() === item.product_id?.toString()
              );
              const requiresSn = selectedProd && Number(selectedProd.serial_number) === 1;

              const snCount = (item.serial_number || []).filter(Boolean).length;

              return (
                <div
                  key={index}
                  className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-1 text-center font-bold text-gray-400 text-sm">
                    #{index + 1}
                  </div>

                  <div className="md:col-span-5 space-y-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                      required
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                    >
                      <option value="">-- ເລືອກສິນຄ້າ --</option>
                      {safeProducts.map((prod) => (
                        <option key={prod.product_id} value={prod.product_id}>
                          {prod.product_name} ({prod.barcode}) - ຄົງເຫຼືອ: {prod.stock_qty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      required
                      placeholder="ຈຳນວນ"
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <input
                      type="text"
                      value={item.comment}
                      onChange={(e) => handleItemChange(index, "comment", e.target.value)}
                      placeholder="ໝາຍເຫດ..."
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center gap-1">
                    {requiresSn && (
                      <button
                        type="button"
                        onClick={() => handleOpenSnModal(index)}
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all relative"
                        title="ກຳນົດ Serial Number"
                      >
                        <i className="fas fa-barcode text-xs"></i>
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                          {snCount}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="ລົບແຖວນີ້"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              ລວມທັງໝົດ <b>{importItems.length}</b> ລາຍການ
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
                {isSubmitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການນຳເຂົ້າ"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}