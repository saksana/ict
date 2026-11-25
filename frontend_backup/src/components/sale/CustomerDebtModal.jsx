import React, { useState, useEffect, useRef } from "react";
import * as customerApi from "../../api/customerApi";
import * as orderApi from "../../api/orderApi";
import * as shopApi from "../../api/shopApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import DebtReceiptA4 from "../DebtReceiptA4";

export default function CustomerDebtModal({ show, onClose }) {
  if (!show) return null;

  const [debtCustomers, setDebtCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // 🟢 ລູກຄ້າທີ່ກຳລັງເລືອກເບິ່ງບິນ
  const [customerOrders, setCustomerOrders] = useState([]); // 🟢 ລາຍການບິນຄ້າງຊຳລະຂອງລູກຄ້າຄົນນັ້ນ
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // --- State ສຳລັບການ Print ໃບບິນຮັບຊຳລະໜີ້ ---
  const [shopInfo, setShopInfo] = useState(null);
  const [printData, setPrintData] = useState(null);
  const receiptRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Debt-Receipt",
  });

  useEffect(() => {
    fetchDebtCustomers();
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      const res = await shopApi.getShop();
      if (res.data?.success && res.data.data) {
        setShopInfo(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load shop info:", err);
    }
  };

  // 1. ດຶງລາຍຊື່ລູກຄ້າທີ່ມີຍອດຕິດໜີ້ (debt_balance > 0)
  const fetchDebtCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomers();
      const customers = res.data.data || res.data || [];
      const filtered = customers.filter((c) => Number(c.debt_balance) > 0);
      setDebtCustomers(filtered);
    } catch (err) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລູກຄ້າຕິດໜີ້ໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // 2. ດຶງລາຍການບິນທັງໝົດມາທຽບ ເພື່ອກອງເອົາສະເພາະບິນທີ່ຍັງຄ້າງຊຳລະຂອງລູກຄ້າທີ່ເລືອກ
  const handleSelectCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setOrdersLoading(true);
    try {
      const res = await orderApi.getOrders();
      const allOrders = res.data || [];
      
      // ກອງເອົາສະເພາະບິນຂອງລູກຄ້າຄົນນີ້ ແລະ ສະຖານະການຈ່າຍຍັງເປັນ unpaid (ຫຼື PENDING)
      const pendingOrders = allOrders.filter(
        (o) =>
          Number(o.customer_id) === Number(cust.customer_id) &&
          (o.payment_status === "unpaid" || o.status === "PENDING")
      );
      setCustomerOrders(pendingOrders);
    } catch (err) {
      toast.error("ບໍ່ສາມາດໂຫຼດລາຍການບິນຂອງລູກຄ້າໄດ້");
    } finally {
      setOrdersLoading(false);
    }
  };

  // 3. 🟢 ຟັງຊັນກົດຊຳລະໜີ້ແຍກຕາມບິນ (`payOrderDebt`)
  const handlePayOrderDebt = async (order) => {
    const netAmount = Number(order.net_amount || 0);

    const { value: amount } = await Swal.fire({
      title: `ຊຳລະໜີ້ບິນ: ${order.order_no || `#${order.order_id}`}`,
      text: `ຍອດໜີ້ຄົງເຫຼືອຂອງບິນນີ້: ${netAmount.toLocaleString()} ກີບ`,
      input: "number",
      inputPlaceholder: "ປ້ອນຈຳນວນເງິນທີ່ຈ່າຍ...",
      inputValue: netAmount,
      showCancelButton: true,
      confirmButtonText: "ຢືນຢັນຮັບຊຳລະ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#f97316",
      customClass: { popup: "rounded-2xl font-lao" },
    });

    if (!amount) return;

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return toast.warning("ກະລຸນາລະບຸຈຳນວນເງິນໃຫ້ຖືກຕ້ອງ!");
    }

    if (payAmount > netAmount) {
      return toast.warning("ຈຳນວນເງິນຊຳລະຫຼາຍກວ່າໜີ້ຄົງເຫຼືອຂອງບິນນີ້!");
    }

    try {
      const res = await orderApi.payOrderDebt(order.order_id, {
        amount_paid: payAmount,
        user_id: user ? user.id : 1,
        payment_method: "Cash",
        note: `ຊຳລະໜີ້ຕາມບິນ ${order.order_no}`,
      });

      toast.success(res.data.message || "ຊຳລະໜີ້ສຳເລັດ!");

      // ກຽມຂໍ້ມູນພິມໃບບິນຮັບເງິນ
      const remainingDebt = res.data.remaining_order_debt !== undefined
        ? res.data.remaining_order_debt
        : netAmount - payAmount;

      await setPrintData({
        paymentData: {
          amount_paid: payAmount,
          remaining_debt: remainingDebt,
          payment_method: "Cash",
        },
        customer: selectedCustomer,
        shopInfo: shopInfo,
      });

      // ສັ່ງ Print ໃບບິນ ແລະ ໂຫຼດຂໍ້ມູນໃໝ່
      setTimeout(() => {
        handlePrint();
        handleSelectCustomer(selectedCustomer); // ໂຫຼດລາຍການບິນຂອງລູກຄ້າຄົນນີ້ໃໝ່
        fetchDebtCustomers(); // ໂຫຼດລາຍຊື່ລູກຄ້າຕິດໜີ້ລວມໃໝ່
      }, 300);

    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-lao">
      <div className="bg-white w-full max-w-3xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Modal */}
        <div className="p-5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <i className="fas fa-file-invoice-dollar text-xl"></i>
            <h3 className="text-lg">
              {selectedCustomer
                ? `ລາຍການບິນຄ້າງຊຳລະຂອງ: ${selectedCustomer.customer_name}`
                : "ລາຍການລູກຄ້າຄ້າງຊຳລະ (Order-based Debt)"}
            </h3>
          </div>
          <button
            onClick={() => {
              if (selectedCustomer) {
                setSelectedCustomer(null); // ຖ້າຢູ່ໃນໜ້າເບິ່ງບິນ ໃຫ້ກົດກັບມາໜ້າລາຍຊື່ລູກຄ້າ
              } else {
                onClose();
              }
            }}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
          >
            <i className={selectedCustomer ? "fas fa-arrow-left" : "fas fa-times"}></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!selectedCustomer ? (
            /* --- 🟢 ຫນ້າທີ 1: ສະແດງລາຍຊື່ລູກຄ້າທີ່ມີຍອດຕິດໜີ້ --- */
            loading ? (
              <div className="text-center py-10 text-gray-400">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
            ) : debtCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <i className="fas fa-check-circle text-4xl text-green-500"></i>
                <p className="text-sm font-bold">ບໍ່ມີລູກຄ້າຄ້າງຊຳລະໜີ້ໃນລະບົບ</p>
              </div>
            ) : (
              debtCustomers.map((cust) => (
                <div
                  key={cust.customer_id}
                  onClick={() => handleSelectCustomer(cust)}
                  className="p-4 bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-200 rounded-2xl flex justify-between items-center shadow-sm cursor-pointer transition-all"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {cust.customer_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ເບີໂທ: {cust.phone || "-"} | ທີ່ຢູ່: {cust.address || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">
                        ຍອດໜີ້ລວມທັງໝົດ
                      </span>
                      <span className="text-base font-black text-red-600 font-mono">
                        {Number(cust.debt_balance).toLocaleString()} ₭
                      </span>
                    </div>
                    <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center text-xs shadow-md">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* --- 🟢 ໜ້າທີ 2: ສະແດງລາຍການບິນຄ້າງຊຳລະ (Order List) ຂອງລູກຄ້າທີ່ຖືກເລືອກ --- */
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mb-2"
              >
                <i className="fas fa-arrow-left"></i> ກັບຄືນໜ້າລາຍຊື່ລູກຄ້າ
              </button>

              {ordersLoading ? (
                <div className="text-center py-10 text-gray-400">ກຳລັງໂຫຼດລາຍການບິນ...</div>
              ) : customerOrders.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <i className="fas fa-check-circle text-3xl text-green-500"></i>
                  <p className="text-sm font-bold">ລູກຄ້າຄົນນີ້ບໍ່ມີບິນຄ້າງຊຳລະ</p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-mono">
                          {order.order_no || `#${order.order_id}`}
                        </span>
                        <span className="text-xs text-gray-400">
                          ວັນທີ: {order.created_at ? order.created_at.replace("T", " ").substring(0, 16) : "-"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        ຈຳນວນສິນຄ້າ: <strong className="text-slate-700">{order.items?.length || 0}</strong> ລາຍການ
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">ຍອດບິນນີ້</span>
                        <span className="text-base font-black text-slate-800 font-mono">
                          {Number(order.net_amount || order.total_amount).toLocaleString()} ₭
                        </span>
                      </div>
                      <button
                        onClick={() => handlePayOrderDebt(order)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1.5"
                      >
                        <i className="fas fa-wallet"></i> ຊຳລະບິນນີ້
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ສ່ວນຊ່ອນ Component ໃບບິນຮັບຊຳລະໜີ້ A4 ໄວ້ສັ່ງພິມອັດຕະໂນມັດ --- */}
      <div className="hidden">
        {printData && (
          <DebtReceiptA4
            ref={receiptRef}
            paymentData={printData.paymentData}
            customer={printData.customer}
            shopInfo={printData.shopInfo}
          />
        )}
      </div>
    </div>
  );
}