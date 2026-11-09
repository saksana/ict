import React from "react";

export default function CustomerModal({
  show,
  onClose,
  isEditMode,
  custForm,
  setCustForm,
  handleSaveCustomer,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-lao">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-scale-in">
        <div className="p-5 bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex justify-between items-center">
          <h3>{isEditMode ? "ແກ້ໄຂຂໍ້ມູນລູກຄ້າ" : "ເພີ່ມລູກຄ້າໃໝ່"}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">ຊື່ລູກຄ້າ *</label>
            <input
              type="text"
              required
              placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
              value={custForm.customer_name}
              onChange={(e) => setCustForm({ ...custForm, customer_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">ເບີໂທລະສັບ *</label>
            <input
              type="text"
              required
              placeholder="ປ້ອນເບີໂທລະສັບ"
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
              value={custForm.phone}
              onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">ທີ່ຢູ່</label>
            <textarea
              placeholder="ປ້ອນທີ່ຢູ່ລູກຄ້າ..."
              rows="2"
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm resize-none"
              value={custForm.address}
              onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              ບັນທຶກ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}