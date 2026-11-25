import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import InvoiceA4 from "../components/InvoiceA4"; // Component ໃບບິນ A4 ທີ່ເຮົາສ້າງກ່ອນໜ້ານີ້

const SaleHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // ເກັບອໍເດີທີ່ກຳລັງເບິ່ງ
  const [orderItems, setOrderItems] = useState([]); // ເກັບສິນຄ້າໃນບິນ
  const [printData, setPrintData] = useState(null); // ເກັບຂໍ້ມູນສຳລັບພິມບິນຄືນ (Reprint)

  const receiptRef = useRef();

  // ລະບົບສັ່ງພິມອັດຕະໂນມັດເມື່ອຂໍ້ມູນພິມພ້ອມ
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => setPrintData(null),
  });

  // ໂຫຼດປະຫວັດການຂາຍທັງໝົດຈາກ API getSalesHistory ຂອງເຈົ້າ
  const fetchSalesHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      // ປ່ຽນ URL ໃຫ້ກົງກັບ Route Backend ຂອງເຈົ້າເດີ
      const response = await axios.get("http://localhost:5000/api/reports/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // ຟັງຊັນຂອງເຈົ້າສົ່ງ res.json(rows) ມາເປັນ Array ເລີຍ
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching sales history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // ເມື່ອກົດເບິ່ງລາຍລະອຽດ
  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/reports/sales-detail/${order.order_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOrderItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // ເມື່ອກົດພິມບິນຄືນ (Reprint)
  const handleReprint = async (order) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/reports/sales-detail/${order.order_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // ແປງຂໍ້ມູນໃຫ້ກົງກັບ Field ທີ່ InvoiceA4 ຕ້ອງການ
        setPrintData({
          orderData: {
            total_amount: order.total_amount,
            discount: order.discount || 0,
            net_amount: order.net_amount,
            payment_method: order.payment_method === "ເງິນສົດ" ? "cash" : "transfer",
            amount_paid: order.net_amount,
            change_amount: 0,
          },
          customer: order.customer_name ? { customer_name: order.customer_name, phone: order.customer_phone || "" } : null,
          cartItems: response.data.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            qty: item.qty,
            unit_price: item.price,
            subtotal: item.subtotal,
          })),
        });
      }
    } catch (error) {
      console.error("Error preparing reprint:", error);
    }
  };

  useEffect(() => {
    if (printData) {
      setTimeout(() => {
        handlePrint();
      }, 300);
    }
  }, [printData]);

  if (loading) return <div className="p-6 text-center font-lao">ກຳລັງໂຫຼດປະຫວັດການຂາຍ...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-lao text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-900">📜 ປະຫວັດການຂາຍ (Sale History)</h1>
        <button onClick={fetchSalesHistory} className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700">
          🔄 ໂຫຼດຄືນໃໝ່
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white font-bold text-xs uppercase">
                <th className="p-4 text-center">ເລກທີບິນ</th>
                <th className="p-4">ວັນທີ-ເວລາ</th>
                <th className="p-4">ລູກຄ້າ</th>
                <th className="p-4">ຜູ້ຂາຍ</th>
                <th className="p-4 text-center">ການຊຳລະ</th>
                <th className="p-4 text-right">ຍອດຊຳລະສຸດທິ</th>
                <th className="p-4 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4 text-center font-mono font-bold text-gray-600">INV-{order.order_id}</td>
                  <td className="p-4 text-gray-600">{new Date(order.created_at).toLocaleString("lo-LA")}</td>
                  <td className="p-4 font-bold">{order.customer_name || <span className="text-gray-400 font-normal">ລູກຄ້າທົ່ວໄປ</span>}</td>
                  <td className="p-4 text-gray-600">{order.seller_name || "Admin"}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.payment_method === 'Cash' || order.payment_method === 'ເງິນສົດ' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {order.payment_method || 'ເງິນສົດ'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-gray-900">{Number(order.net_amount).toLocaleString()} ກີບ</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => handleViewDetail(order)} className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200">
                      👁️ ເບິ່ງ
                    </button>
                    <button onClick={() => handleReprint(order)} className="px-3 py-1.5 bg-orange-50 text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-100">
                      🖨️ ພິມຄືນ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== POPUP MODAL: ສະແດງລາຍລະອຽດບິນ ==================== */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-black text-gray-900">📄 ລາຍລະອຽດບິນ INV-{selectedOrder.order_id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl">
              <div>
                <p><span className="font-bold">ວັນທີ:</span> {new Date(selectedOrder.created_at).toLocaleString("lo-LA")}</p>
                <p><span className="font-bold">ລູກຄ້າ:</span> {selectedOrder.customer_name || "ລູກຄ້າທົ່ວໄປ"}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">ຜູ້ຂາຍ:</span> {selectedOrder.seller_name || "Admin"}</p>
                <p className="text-orange-600 font-bold"><span className="text-gray-600">ຍອດສຸດທິ:</span> {Number(selectedOrder.net_amount).toLocaleString()} ກີບ</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 font-bold">
                  <th className="pb-2">ລາຍການສິນຄ້າ</th>
                  <th className="pb-2 text-center w-20">ຈຳນວນ</th>
                  <th className="pb-2 text-right w-28">ລາຄາ</th>
                  <th className="pb-2 text-right w-28">ລວມ</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2.5 font-bold text-gray-800">{item.product_name}</td>
                    <td className="py-2.5 text-center font-bold text-gray-600">{item.qty}</td>
                    <td className="py-2.5 text-right">{Number(item.price).toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold text-gray-950">{Number(item.subtotal).toLocaleString()} ກີບ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end space-x-2 mt-6 pt-3 border-t">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200">
                ປິດໜ້າຕ່າງ
              </button>
              <button onClick={() => { handleReprint(selectedOrder); setSelectedOrder(null); }} className="px-4 py-2 bg-orange-600 text-white font-bold text-sm rounded-xl hover:bg-orange-700">
                🖨️ ພິມບິນນີ້
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ສ່ວນຊ່ອນ Component ໃບບິນ A4 ສຳລັບໃຊ້ໃນການ Reprint */}
      <div className="hidden">
        {printData && (
          <InvoiceA4
            ref={receiptRef}
            orderData={printData.orderData}
            customer={printData.customer}
            cartItems={printData.cartItems}
          />
        )}
      </div>
    </div>
  );
};

export default SaleHistoryPage;