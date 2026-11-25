import React, { useState, useEffect, forwardRef } from "react";
import * as shopApi from "../api/shopApi"; // 👈 ນຳເຂົ້າ shopApi ເພື່ອດຶງຂໍ້ມູນຮ້ານຄ້າໃຫ້ົງກັນກັບ Invoice

const QuotationA4 = forwardRef(
  ({ quotationData, customer, cartItems }, ref) => {
    const [shopInfo, setShopInfo] = useState({
      shop_name: "MY_SHOP",
      phone: "",
      email: "",
      address: "",
    });

    // ດຶງຂໍ້ມູນຮ້ານຄ້າຈາກ DB ມາສະແດງໃຫ້ົງກັນກັບໃບບິນ
    useEffect(() => {
      const fetchShopInfo = async () => {
        try {
          const res = await shopApi.getShop();
          if (res.data?.success && res.data.data) {
            setShopInfo(res.data.data);
          }
        } catch (err) {
          console.error("Failed to load shop info for quotation:", err);
        }
      };
      fetchShopInfo();
    }, []);

    // ວັນທີ ແລະ ເວລາ
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
      <div
        ref={ref}
        className="p-10 bg-white text-black font-lao w-[210mm] min-h-[297mm] mx-auto flex flex-col justify-between"
        style={{ boxSizing: "border-box" }}
      >
        {/* ສ່ວນເທິງ: Header ແລະ ຂໍ້ມູນຮ້ານຄ້າ (ດຶງຈາກ Setting ດຽວກັນກັບ Invoice) */}
        <div>
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
                ໃບສະເໜີລາຄາ / QUOTATION
              </h2>
              <p className="text-xs">
                <span className="font-bold text-gray-500">ເລກທີ / No:</span>{" "}
                <span className="font-bold font-mono">{quotationData?.quotation_no}</span>
              </p>
              <p className="text-xs">
                <span className="font-bold text-gray-500">ວັນທີ / Date:</span>{" "}
                {formatDateTime(quotationData?.created_at)}
              </p>
            </div>
          </div>

          {/* ສ່ວນຂໍ້ມູນລູກຄ້າ ແລະ ເງື່ອນໄຂ */}
          <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
            <div className="space-y-1">
              <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                ສະເໜີໃຫ້ / Customer
              </p>
              <p className="text-sm font-bold text-gray-800">
                {customer ? customer.customer_name : "ລູກຄ້າທົ່ວໄປ"}
              </p>
              {customer && (
                <>
                  <p>
                    <span className="text-gray-500">ໂທ / Tel:</span>{" "}
                    {customer.phone || "-"}
                  </p>
                </>
              )}
            </div>
            <div className="space-y-1 text-right md:text-left md:pl-20">
              <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                ເງື່ອນໄຂ / Conditions
              </p>
              <p className="text-gray-600">
                ໃບລາຄານີ້ມີຜົນບັງຄັບໃຊ້ພາຍໃນ 15 ວັນ
              </p>
            </div>
          </div>

          {/* ຕາຕະລາງລາຍການສິນຄ້າ */}
          <table className="w-full text-left border-collapse text-xs mt-4">
            <thead>
              <tr className="bg-gray-800 text-white font-bold uppercase">
                <th className="p-3 text-center rounded-l-xl w-12">ລຳດັບ</th>
                <th className="p-3">ລາຍການສິນຄ້າ</th>
                <th className="p-3 text-center w-24">ຈຳນວນ</th>
                <th className="p-3 text-right w-32">ລາຄາ/ໜ່ວຍ</th>
                <th className="p-3 text-right rounded-r-xl w-36">
                  ລວມເປັນເງິນ
                </th>
              </tr>
            </thead>
            <tbody>
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="p-3 text-center text-gray-500">
                      {index + 1}
                    </td>
                    <td className="p-3 font-bold text-gray-800">
                      {item.product_name}
                    </td>
                    <td className="p-3 text-center font-bold font-mono">{item.qty}</td>
                    <td className="p-3 text-right font-mono">
                      {Number(item.unit_price).toLocaleString()} ກີບ
                    </td>
                    <td className="p-3 text-right font-black font-mono">
                      {Number(item.subtotal).toLocaleString()} ກີບ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">
                    ບໍ່ມີລາຍການສິນຄ້າ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ສ່ວນລຸ່ມ: ສະຫຼຸບເງິນ ແລະ ລາຍເຊັນ */}
        <div className="mt-10">
          <div className="flex justify-between items-start gap-10">
            {/* ໝາຍເຫດ (ດ້ານຊ້າຍ) */}
            <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 space-y-1">
              <p className="font-bold text-gray-700">
                ໝາຍເຫດ / Terms & Conditions:
              </p>
              <p>1. ໃບສະເໜີລາຄານີ້ໃຊ້ສຳລັບການພິຈາລະນາສັ່ງຊື້ເທົ່ານັ້ນ.</p>
              <p>2. ລາຄາດັ່ງກ່າວອາດມີການປ່ຽນແປງ.</p>
            </div>

            {/* ສະຫຼຸບຍອດ (ດ້ານຂວາ) */}
            <div className="w-80 space-y-2 text-xs font-bold text-gray-700">
              <div className="flex justify-between px-2">
                <span className="font-normal text-gray-500">
                  ລວມເປັນເງິນ (Sub Total):
                </span>
                <span className="font-mono">
                  {Number(quotationData?.total_amount || 0).toLocaleString()} ກີບ
                </span>
              </div>
              {quotationData?.discount > 0 && (
                <div className="flex justify-between px-2 text-red-600">
                  <span className="font-normal">ສ່ວນຫຼຸດ (Discount):</span>
                  <span className="font-mono">
                    -{Number(quotationData?.discount || 0).toLocaleString()} ກີບ
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-black bg-orange-50 text-orange-600 p-3 rounded-xl border border-orange-100">
                <span>ຍອດລວມທັງໝົດ:</span>
                <span className="font-mono">
                  {Number(quotationData?.net_amount || 0).toLocaleString()} ກີບ
                </span>
              </div>
            </div>
          </div>

          {/* ບ່ອນເຊັນຊື່ (ລຸ່ມສຸດຂອງໜ້າ A4) */}
          <div className="grid grid-cols-2 gap-4 text-center text-xs mt-8 pt-5">
            <div className="flex flex-col items-center justify-between h-36">
              <p className="text-gray-500">ຜູ້ສະເໜີລາຄາ / Issued By</p>
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-gray-300"></div>
                <p className="text-[11px] text-gray-400 mt-4">
                  ວັນທີ: .......................................
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between h-36">
              <p className="text-gray-500">ຜູ້ອະນຸມັດ / Approved By</p>
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-gray-300"></div>
                <p className="text-[11px] text-gray-400 mt-4">
                  ວັນທີ: .......................................
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

QuotationA4.displayName = "QuotationA4";
export default QuotationA4;