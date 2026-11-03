import React, { useState, useEffect, useRef } from "react";
import * as productApi from "../api/productApi";
import * as orderApi from "../api/orderApi";
import * as customerApi from "../api/customerApi";
import * as categoryApi from "../api/categoryApi";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import InvoiceA4 from "../components/InvoiceA4";
import Cart from "../components/Cart";
import ProductGrid from "../components/ProductGrid";

const SalePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSearching, setIsSearching] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // --- State ສຳລັບລະບົບລູກຄ້າ ---
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // --- State ສຳລັບ CRUD ລູກຄ້າ ---
  const [showCustModal, setShowCustModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustId, setEditingCustId] = useState(null);
  const [custForm, setCustForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    points: 0,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [showCartMobile, setShowCartMobile] = useState(false);
  const [printData, setPrintData] = useState(null);
  const receiptRef = useRef(null);

  // --- 🟢 State ໃໝ່ສຳລັບ Modal ປະຫວັດການຂາຍ ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // ວັນທີປະຈຸບັນ YYYY-MM-DD

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerSearch.trim() === "") {
      setFilteredCustomers([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = customers.filter(
        (cust) =>
          cust.customer_name
            .toLowerCase()
            .includes(customerSearch.toLowerCase()) ||
          (cust.phone && cust.phone.includes(customerSearch)) ||
          cust.customer_id.toString() === customerSearch
      );
      setFilteredCustomers(filtered);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [customerSearch, customers]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data.data || res.data || []);
    } catch (err) {
      console.error("ໂຫລດປະເພດສິນຄ້າບໍ່ສຳເລັດ");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAllProducts({
        search,
        category_id: selectedCategory || null,
      });
      setProducts(res.data.data || res.data);
    } catch (err) {
      toast.error("ໂຫລດສິນຄ້າບໍ່ສຳເລັດ");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.getCustomers();
      setCustomers(res.data.data || res.data || []);
    } catch (err) {
      toast.error("ໂຫລດຂໍ້ມູນລູກຄ້າບໍ່ສຳເລັດ");
    }
  };

  // --- 🟢 ຟັງຊັນໂຫລດປະຫວັດການຂາຍ ---
  const handleOpenHistoryModal = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrdersHistory(res.data || []);
      setShowHistoryModal(true);
    } catch (err) {
      toast.error("ບໍ່ສາມາດໂຫລດປະຫວັດການຂາຍໄດ້");
    }
  };

  // กรอง Orders ຕາມວັນທີທີ່ເລືອກ (ສົມມຸດ Field ວັນທີໃນ tb_order ແມ່ນ created_at ຫຼື order_date)
  const filteredOrders = ordersHistory.filter((order) => {
    const orderDateStr = order.created_at || order.order_date;
    if (!orderDateStr) return false;
    return orderDateStr.startsWith(filterDate);
  });

  // ຟັງຊັນສຳລັບກົດພິມບິນຍ้อนຫຼັງ
  const handlePrintExistingOrder = async (order) => {
    // ດຶງຂໍ້ມູນລູກຄ້າ ຫຼື ຈັດກຽມ cartItems ຕາມໂຄງສ້າງ b_order ຂອງທ່ານ
    const customerObj =
      customers.find((c) => c.customer_id === order.customer_id) || null;
    
    // ຖ້າ API order ມີ items ມາພ້ອມແລ້ວ ສາມາດໃຊ້ items ໄດ້ເລີຍ ຫຼື ປັບຕາມໂຄງສ້າງ Response ຂອງທ່ານ
    await setPrintData({
      orderData: order,
      customer: customerObj,
      cartItems: order.items || [], 
    });

    setTimeout(() => {
      handlePrint();
    }, 300);
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCustForm({ customer_name: "", phone: "", address: "", points: 0 });
    setShowCustModal(true);
  };

  const handleOpenEditModal = (cust) => {
    setIsEditMode(true);
    setEditingCustId(cust.customer_id);
    setCustForm({
      customer_name: cust.customer_name,
      phone: cust.phone || "",
      address: cust.address || "",
      points: cust.points || 0,
    });
    setShowCustModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!custForm.customer_name || !custForm.phone) {
      return toast.warning("ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ!");
    }

    try {
      if (isEditMode) {
        const res = await customerApi.updateCustomer(editingCustId, custForm);
        toast.success(res.data.message || "ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ!");
        if (
          selectedCustomerObj &&
          selectedCustomerObj.customer_id === editingCustId
        ) {
          setSelectedCustomerObj({ ...selectedCustomerObj, ...custForm });
        }
      } else {
        const res = await customerApi.createCustomer(custForm);
        toast.success(res.data.message || "ເພີ່ມຂໍ້ມູນລູກຄ້າສຳເລັດ!");
      }
      setShowCustModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລູກຄ້າຄົນນີ້?")) {
      try {
        const res = await customerApi.deleteCustomer(id);
        toast.success(res.data.message || "ລຶບລູກຄ້າສຳເລັດ!");
        if (selectedCustomerObj && selectedCustomerObj.customer_id === id) {
          setSelectedCustomerObj(null);
          setCustomerSearch("");
        }
        fetchCustomers();
      } catch (err) {
        toast.error(err.response?.data?.message || "ບໍ່ສາມາດລຶບໄດ້");
      }
    }
  };

  const updateQty = (productId, newQty, stockQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    if (newQty > stockQty) {
      toast.warning("ສິນຄ້າໃນສະຕັອກບໍ່ພໍ!");
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              qty: Number(newQty),
              subtotal: Number(newQty) * Number(item.unit_price),
            }
          : item
      )
    );
  };

  const addToCart = (p) => {
    const stock = Number(p.stock_qty);
    if (stock <= 0) return toast.warning("ສິນຄ້າໝົດສະຕັອກ!");
    const existing = cart.find((item) => item.product_id === p.product_id);
    if (existing) {
      updateQty(p.product_id, existing.qty + 1, stock);
    } else {
      setCart([
        ...cart,
        {
          product_id: p.product_id,
          product_name: p.product_name,
          qty: 1,
          unit_price: Number(p.sale_price),
          subtotal: Number(p.sale_price),
          image: p.image,
          stock_qty: stock,
        },
      ]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.product_id !== id));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );
  const netAmount =
    totalAmount - Number(discount) > 0 ? totalAmount - Number(discount) : 0;
  const changeAmount = Number(amountPaid) - netAmount;

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Invoice-Receipt",
  });

  const handleConfirmOrder = async () => {
    if (paymentMethod === "cash" && Number(amountPaid) < netAmount) {
      return toast.warning("ເງິນທີ່ຮັບມາບໍ່ພໍ!");
    }

    const orderData = {
      customer_id: selectedCustomerObj
        ? Number(selectedCustomerObj.customer_id)
        : 1,
      user_id: user.id,
      total_amount: totalAmount,
      discount: Number(discount),
      net_amount: netAmount,
      status: "COMPLETE",
      updated_by: user.id,
      payment_method: paymentMethod,
      amount_paid:
        paymentMethod === "cash"
          ? Number(amountPaid)
          : paymentMethod === "credit"
            ? 0
            : netAmount,
      change_amount:
        paymentMethod === "cash" && changeAmount > 0 ? changeAmount : 0,
      payment_status: paymentMethod === "credit" ? "unpaid" : "paid",
      items: cart.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })),
    };

    try {
      const res = await orderApi.createOrder(orderData);
      if (res.status === 201) {
        toast.success(res.data.message);
        await setPrintData({
          orderData: orderData,
          customer: selectedCustomerObj,
          cartItems: [...cart],
        });

        setTimeout(() => {
          handlePrint();
          setCart([]);
          setAmountPaid(0);
          setDiscount(0);
          setSelectedCustomerObj(null);
          setCustomerSearch("");
          setShowPaymentModal(false);
          setShowCartMobile(false);
          fetchProducts();
        }, 300);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex h-screen bg-gray-100 font-lao overflow-hidden relative">
      <ProductGrid
        search={search}
        setSearch={setSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        products={products}
        addToCart={addToCart}
        onOpenOrderHistory={handleOpenHistoryModal}
      />

      <Cart
        cart={cart}
        totalCartItems={totalCartItems}
        showCartMobile={showCartMobile}
        setShowCartMobile={setShowCartMobile}
        selectedCustomerObj={selectedCustomerObj}
        setSelectedCustomerObj={setSelectedCustomerObj}
        customerSearch={customerSearch}
        setCustomerSearch={setCustomerSearch}
        showCustomerDropdown={showCustomerDropdown}
        setShowCustomerDropdown={setShowCustomerDropdown}
        isSearching={isSearching}
        filteredCustomers={filteredCustomers}
        handleOpenAddModal={handleOpenAddModal}
        handleOpenEditModal={handleOpenEditModal}
        handleDeleteCustomer={handleDeleteCustomer}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        totalAmount={totalAmount}
        discount={discount}
        setDiscount={setDiscount}
        netAmount={netAmount}
        setShowPaymentModal={setShowPaymentModal}
      />

      {/* Floating Button ສຳລັບມືຖື */}
      <button
        onClick={() => setShowCartMobile(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl z-30 flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        <div className="relative">
          <i className="fas fa-shopping-cart text-xl"></i>
          {totalCartItems > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-bounce">
              {totalCartItems}
            </span>
          )}
        </div>
        <span className="font-bold text-sm pr-1">ເບິ່ງກະຕ່າ</span>
      </button>

      {/* --- 🟢 Modal ສະແດງປະຫວັດການຂາຍ --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
                  <i className="fas fa-history"></i>
                </div>
                <h3 className="text-lg">ປະຫວັດການຂາຍ</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Sub-header: ເລືອກວັນທີ */}
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
                ພົບທັງໝົດ: <strong className="text-slate-700">{filteredOrders.length}</strong> ລາຍການ
              </span>
            </div>

            {/* List ປະຫວັດການຂາຍ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <i className="fas fa-file-invoice text-3xl"></i>
                  <p className="text-sm font-bold">ບໍ່ມີປະຫວັດການຂາຍໃນວັນທີນີ້</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-orange-200 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-50 text-orange-600 font-black text-xs px-2.5 py-1 rounded-lg">
                          #{order.order_id}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          <i className="far fa-clock mr-1"></i>
                          {order.created_at || order.order_date}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        ຍອດລວມ: <span className="text-orange-600 font-black">{Number(order.net_amount || order.total_amount).toLocaleString()} ກີບ</span>
                        <span className="text-xs text-gray-400 ml-2 font-normal">
                          (ຊຳລະຜ່ານ: {order.payment_method})
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handlePrintExistingOrder(order)}
                        className="px-4 py-2 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <i className="fas fa-print"></i> ພິມບິນຄືນ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ຊຳລະເງິນ */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center relative">
              <span className="text-xs uppercase tracking-wider opacity-80 block mb-1 font-bold">
                ຍອດຊຳລະສຸດທິ
              </span>
              <h2 className="text-3xl font-black tracking-tight">
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
                        type="number"
                        autoFocus
                        placeholder="0"
                        className="w-full text-3xl font-black p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-800"
                        value={amountPaid || ""}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
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
                  <p className="text-xs text-red-500 font-medium">
                    ຍອດຄ້າງຊຳລະຈະຖືກບັນທຶກເຂົ້າໃນປະຫວັດໜີ້ຂອງລູກຄ້າ
                  </p>
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
                  className={`text-2xl font-black tracking-tight ${
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
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod("cash");
                  }}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={
                    paymentMethod === "cash" && Number(amountPaid) < netAmount
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
      )}

      {/* Modal CRUD ລູກຄ້າ */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-scale-in">
            <div className="p-5 bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex justify-between items-center">
              <h3>
                {isEditMode ? "ແກ້ໄຂຂໍ້ມູນລູກຄ້າ" : "ເພີ່ມລູກຄ້າໃໝ່"}
              </h3>
              <button
                onClick={() => setShowCustModal(false)}
                className="text-white/70 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  ຊື່ລູກຄ້າ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  value={custForm.customer_name}
                  onChange={(e) =>
                    setCustForm({ ...custForm, customer_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  ເບີໂທລະສັບ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ປ້ອນເບີໂທລະສັບ"
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  value={custForm.phone}
                  onChange={(e) =>
                    setCustForm({ ...custForm, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  ທີ່ຢູ່
                </label>
                <textarea
                  placeholder="ປ້ອນທີ່ຢູ່ລູກຄ້າ..."
                  rows="2"
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm resize-none"
                  value={custForm.address}
                  onChange={(e) =>
                    setCustForm({ ...custForm, address: e.target.value })
                  }
                />
              </div>
              {isEditMode && (
                <div className="hidden">
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    ຄະແນນ (Points)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                    value={custForm.points}
                    onChange={(e) =>
                      setCustForm({
                        ...custForm,
                        points: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
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
      )}

      {/* ສ່ວນຊ່ອນ Component ໃບບິນ A4 ໄວ້ສັ່ງພິມ */}
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

export default SalePage;