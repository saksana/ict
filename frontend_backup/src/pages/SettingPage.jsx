import React, { useState, useEffect } from "react";
import * as shopApi from "../api/shopApi";
import { toast } from "react-toastify";

const SettingPage = () => {
  const [shopForm, setShopForm] = useState({
    shop_id: "",
    shop_name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    setIsLoading(true);
    try {
      const res = await shopApi.getShop();
      if (res.data?.success && res.data.data) {
        setShopForm(res.data.data);
      }
    } catch (err) {
      console.error("Fetch shop error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນຮ້ານຄ້າໄດ້");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!shopForm.shop_name.trim()) {
      toast.error("ກະລຸນາປ້ອນຊື່ຮ້ານຄ້າ!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await shopApi.updateShop(shopForm.shop_id, shopForm);
      if (res.data?.success) {
        toast.success(res.data?.message || "ບັນທຶກຂໍ້ມູນຮ້ານຄ້າສຳເລັດ!");
        fetchShopData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header ຫົວຂໍ້ */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-store"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ຕັ້ງຄ່າຂໍ້ມູນຮ້ານຄ້າ
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ຈັດການຂໍ້ມູນທົ່ວໄປຂອງຮ້ານຄ້າທີ່ຈະສະແດງໃນໃບບິນ ແລະ ລະບົບ
            </p>
          </div>
        </div>
      </div>

      {/* Main Card Form Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100  mx-auto">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
          
          <div>
            <h3 className="text-base font-bold text-gray-800">
              
            </h3>
            <p className="text-xs text-gray-400">
              ຂໍ້ມູນເບື້ອງຕົ້ນທີ່ໃຊ້ໃນການອອກໃບບິນ
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin mr-2 text-lg text-orange-500"></i>{" "}
            ກຳລັງໂຫລດຂໍ້ມູນ...
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Shop Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 ml-1">
                ຊື່ຮ້ານຄ້າ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <i className="fas fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  name="shop_name"
                  value={shopForm.shop_name || ""}
                  onChange={handleInputChange}
                  placeholder="ປ້ອນຊື່ຮ້ານຄ້າ..."
                  required
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  ເບີໂທລະສັບ
                </label>
                <div className="relative">
                  <i className="fas fa-phone-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    name="phone"
                    value={shopForm.phone || ""}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນເບີໂທລະສັບຮ້ານ..."
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-gray-800"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  ອີເມວ (Email)
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="email"
                    name="email"
                    value={shopForm.email || ""}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນອີເມວຮ້ານ..."
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 ml-1">
                ທີ່ຢູ່ຮ້ານຄ້າ
              </label>
              <textarea
                name="address"
                rows="3"
                value={shopForm.address || ""}
                onChange={handleInputChange}
                placeholder="ປ້ອນທີ່ຢູ່ຕັ້ງຂອງຮ້ານຄ້າ..."
                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-gray-800 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <i className="fas fa-spinner fa-spin"></i>}
                <i className="fas fa-save text-xs"></i>
                <span>{isSaving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການປ່ຽນແປງ"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingPage;
