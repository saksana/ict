import React, { useState, useEffect } from "react";
import * as shopApi from "../api/shopApi"; // 👈 ນຳເຂົ້າ shopApi ເພື່ອດຶງຂໍ້ມູນຮ້ານ

const InvoiceA4 = React.forwardRef(
  ({ orderData, customer, cartItems }, ref) => {
    const [shopInfo, setShopInfo] = useState({
      shop_name: "MY_SHOP",
      phone: "",
      email: "",
      address: "",
    });

    // ກວດສອບວ່າເປັນບິນຕິດໜີ້ ຫຼື ບໍ່
    const isCreditOrder =
      orderData?.payment_method === "credit" ||
      orderData?.payment_status === "unpaid";

    // ດຶງຂໍ້ມູນຮ້ານຄ້າຈາກ DB ມາສະແດງໃນໃບບິນ
    useEffect(() => {
      const fetchShopInfo = async () => {
        try {
          const res = await shopApi.getShop();
          if (res.data?.success && res.data.data) {
            setShopInfo(res.data.data);
          }
        } catch (err) {
          console.error("Failed to load shop info for invoice:", err);
        }
      };
      fetchShopInfo();
    }, []);

    // 🟢 ຟັງຊັນແປງວັນທີໃຫ້ເປັນ dd/mm/yyyy HH:mm
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
        {/* ສ່ວນເທິງ: Header ແລະ ຂໍ້ມູນບໍລິສັດ (ດຶງຈາກ Setting) */}
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
              {/* 🟢 ປ່ຽນຫົວໃບບິນອັດຕະໂນມັດ ຖ້າເປັນ credit ໃຫ້ສະແດງເປັນ "ໃບສົ່ງສິນຄ້າ / ຮຽກເກັບເງິນ" */}
              <h2 className="text-xl font-black text-gray-800 tracking-tight">
                {isCreditOrder
                  ? "ໃບສົ່ງສິນຄ້າ / ຮຽກເກັບເງິນ"
                  : "ໃບບິນຮັບເງິນ / INVOICE"}
              </h2>
              <p className="text-xs">
                <span className="font-bold text-gray-500">ເລກທີ / No:</span>{" "}
                <span className="font-bold">{orderData?.order_no}</span>
              </p>
              <p className="text-xs">
                <span className="font-bold text-gray-500">ວັນທີ / Date:</span>{" "}
                {formatDateTime(orderData?.created_at)}
              </p>
            </div>
          </div>

          {/* ສ່ວນຂໍ້ມູນລູກຄ້າ */}
          <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
            <div className="space-y-1">
              <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                ລູກຄ້າ / Customer
              </p>
              <p className="text-sm font-bold text-gray-800">
                {customer ? customer.customer_name : "ລູກຄ້າທົ່ວໄປ"}
              </p>
              {customer && (
                <>
                  <p>
                    <span className="text-gray-500">ທີ່ຢູ່:</span>{" "}
                    {customer.address || "-"}
                  </p>
                  <p>
                    <span className="text-gray-500">ໂທ / Tel:</span>{" "}
                    {customer.phone || "-"}
                  </p>
                </>
              )}
            </div>
            <div className="space-y-1 text-right md:text-left md:pl-20">
              <p className="font-black text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                ການຊຳລະເງິນ / Payment
              </p>
              <p>
                <span className="text-gray-500">ຊ່ອງທາງ:</span>{" "}
                <span className="font-bold text-orange-600">
                  {orderData?.payment_method === "cash"
                    ? "Cash (ເງິນສົດ)"
                    : orderData?.payment_method === "credit"
                      ? "Credit (ຕິດໜີ້)"
                      : "QR Bank Transfer (ໂອນເງິນ)"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">ພະນັກງານຂາຍ:</span> Admin (ID:{" "}
                {orderData?.user_id || 1})
              </p>
              <p>
                <span className="text-gray-500">ສະຖານະ:</span>{" "}
                <span
                  className={`font-bold ${
                    isCreditOrder ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {orderData?.payment_status === "unpaid"
                    ? "ຄ້າງຊຳລະ (Unpaid - ຕິດໜີ້)"
                    : "ຊຳລະແລ້ວ (Paid)"}
                </span>
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
                    <td className="p-3 text-center font-bold">{item.qty}</td>
                    <td className="p-3 text-right">
                      {Number(item.unit_price).toLocaleString()} ກີບ
                    </td>
                    <td className="p-3 text-right font-black">
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
              <p>1. ກວດສອບສິນຄ້າ ແລະ ເງິນທອນໃຫ້ຄົບຖ້ວນກ່ອນອອກຈາກຮ້ານ.</p>
              <p>2. ສິນຄ້າຊື້ແລ້ວ ບໍ່ສາມາດປ່ຽນ ຫຼື ສົ່ງຄືນໄດ້ທຸກກໍລະນີ.</p>
              {isCreditOrder && (
                <p className="text-red-500 font-bold mt-1">
                  * ກະລຸນາຊຳລະຍອດຄ້າງຊຳລະຕາມກຳນົດເວລາຂໍຂອບໃຈ.
                </p>
              )}
            </div>

            {/* ສະຫຼຸບຍອດ (ດ້ານຂວາ) */}
            <div className="w-80 space-y-2 text-xs font-bold text-gray-700">
              <div className="flex justify-between px-2">
                <span className="font-normal text-gray-500">
                  ລວມເປັນເງິນ (Sub Total):
                </span>
                <span>
                  {Number(orderData?.total_amount || 0).toLocaleString()} ກີບ
                </span>
              </div>
              <div className="flex justify-between px-2 text-red-600">
                <span className="font-normal">ສ່ວນຫຼຸດ (Discount):</span>
                <span>
                  -{Number(orderData?.discount || 0).toLocaleString()} ກີບ
                </span>
              </div>
              <div
                className={`flex justify-between text-base font-black p-3 rounded-xl border ${
                  isCreditOrder
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-orange-50 text-orange-600 border-orange-100"
                }`}
              >
                <span>
                  {isCreditOrder
                    ? "ຍອດຄ້າງຊຳລະ (Total Debt):"
                    : "ຍອດຊຳລະສຸດທິ:"}
                </span>
                <span>
                  {Number(orderData?.net_amount || 0).toLocaleString()} ກີບ
                </span>
              </div>

              {/* 🟢 ສະແດງສະເພາະບິນທີ່ຈ່າຍເງິນສົດ/ໂອນ (ຖ້າເປັນຕິດໜີ້ ຈະບໍ່ສະແດງເງິນຮັບ/ເງິນທອນ) */}
              {!isCreditOrder && (
                <div className="pt-2 space-y-1 text-[11px] font-normal text-gray-500 px-2">
                  <div className="flex justify-between">
                    <span>ຮັບເງິນມາ (Amount Received):</span>
                    <span>
                      {Number(orderData?.amount_paid || 0).toLocaleString()} ກີບ
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>ເງິນທອນ (Change):</span>
                    <span>
                      {Number(orderData?.change_amount || 0).toLocaleString()}{" "}
                      ກີບ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ບ່ອນເຊັນຊື່ (ລຸ່ມສຸດຂອງໜ້າ A4) */}
          <div className="grid grid-cols-2 gap-4 text-center text-xs mt-2 pt-5">
            <div className="flex flex-col items-center justify-between h-36">
              <p className="text-gray-500">ຜູ້ຊື້ / Customer Signature</p>
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-gray-300"></div>
                <p className="text-[11px] text-gray-400 mt-4">
                  ວັນທີ: .......................................
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between h-36">
              <p className="text-gray-500">
                {isCreditOrder
                  ? "ຜູ້ຮຽກເກັບເງິນ / Issuer"
                  : "ຜູ້ຮັບເງິນ / Authorized Signature"}
              </p>
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

InvoiceA4.displayName = "InvoiceA4";
export default InvoiceA4;
