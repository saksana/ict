import React, { useState, useEffect, forwardRef } from "react";
import * as shopApi from "../api/shopApi";

const DebtReceiptA4 = forwardRef(
  ({ paymentData, customer, shopInfo: initialShopInfo }, ref) => {
    const [shopInfo, setShopInfo] = useState(
      initialShopInfo || {
        shop_name: "MY_SHOP",
        phone: "",
        email: "",
        address: "",
      }
    );

    useEffect(() => {
      if (!initialShopInfo) {
        const fetchShop = async () => {
          try {
            const res = await shopApi.getShop();
            if (res.data?.success && res.data.data) {
              setShopInfo(res.data.data);
            }
          } catch (err) {
            console.error("Failed to load shop info:", err);
          }
        };
        fetchShop();
      }
    }, [initialShopInfo]);

    const formatDateTime = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
      <div
        ref={ref}
        className="p-10 bg-white text-black font-lao w-[210mm] min-h-[297mm] mx-auto flex flex-col justify-between"
        style={{ boxSizing: "border-box" }}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-5">
            <div className="space-y-1">
              <h1 className="text-lg font-black text-orange-600 uppercase tracking-wide">
                {shopInfo.shop_name}
              </h1>
              <p className="text-xs text-gray-600">{shopInfo.address || "-"}</p>
              <p className="text-xs text-gray-600">
                ໂທ: {shopInfo.phone || "-"} | Email: {shopInfo.email || "-"}
              </p>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">
                ໃບຮັບເງິນຊຳລະໜີ້ / DEBT RECEIPT
              </h2>
              <p className="text-xs">
                <span className="font-bold text-gray-500">ວັນທີ / Date:</span>{" "}
                {formatDateTime()}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
            <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">
              ລູກຄ້າ / Customer
            </p>
            <p className="text-sm font-bold text-gray-800">
              {customer ? customer.customer_name : "ລູກຄ້າທົ່ວໄປ"}
            </p>
            <p>
              <span className="text-gray-500">ທີ່ຢູ່:</span>{" "}
              {customer?.address || "-"}
            </p>
            <p>
              <span className="text-gray-500">ໂທ / Tel:</span>{" "}
              {customer?.phone || "-"}
            </p>
          </div>

          {/* Payment Summary Box */}
          <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-bold">ຊ່ອງທາງການຊຳລະ:</span>
              <span className="font-black text-slate-800">
                {paymentData?.payment_method || "Cash (ເງິນສົດ)"}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-orange-200/60 pt-3">
              <span className="text-gray-600 font-bold">ຈຳນວນເງິນທີ່ຮັບຊຳລະຄັ້ງນີ້:</span>
              <span className="text-lg font-black text-orange-600 font-mono">
                {Number(paymentData?.amount_paid || 0).toLocaleString()} ກີບ
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-orange-200/60 pt-3">
              <span className="text-gray-600 font-bold">ຍອດໜີ້ຄົງເຫຼືອຂອງບິນນີ້:</span>
              <span className="text-base font-black text-red-600 font-mono">
                {Number(paymentData?.remaining_debt || 0).toLocaleString()} ກີບ
              </span>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-4 text-center text-xs mt-10 pt-5">
          <div className="flex flex-col items-center justify-between h-36">
            <p className="text-gray-500">ຜູ້ຊຳລະເງິນ / Customer</p>
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-300"></div>
              <p className="text-[11px] text-gray-400 mt-4">
                ວັນທີ: .......................................
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between h-36">
            <p className="str text-gray-500">ຜູ້ຮັບເງິນ / Collector</p>
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-300"></div>
              <p className="text-[11px] text-gray-400 mt-4">
                ວັນທີ: .......................................
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DebtReceiptA4.displayName = "DebtReceiptA4";
export default DebtReceiptA4;