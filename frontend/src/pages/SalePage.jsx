import { useState, useEffect, useRef } from "react";
import * as productApi from "../api/productApi";
import * as orderApi from "../api/orderApi";
import * as customerApi from "../api/customerApi";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import InvoiceReceipt from "../components/InvoiceReceipt";
import InvoiceA4 from "../components/InvoiceA4";

const SalePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  // --- State ສໍາລັບລະບົບລູກຄ້າ ---
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // --- State ໃໝ່ສໍາລັບ CRUD ລູກຄ້າ ---
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

  useEffect(() => {
    fetchProducts();
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerSearch.trim() === "") {
      setFilteredCustomers([]);
    } else {
      const filtered = customers.filter(
        (cust) =>
          cust.customer_name
            .toLowerCase()
            .includes(customerSearch.toLowerCase()) ||
          (cust.phone && cust.phone.includes(customerSearch)) ||
          cust.customer_id.toString() === customerSearch,
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearch, customers]);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAllProducts(search);
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

  // --- ຟັງຊັນຈັດການ CRUD ລູກຄ້າ ---
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
        // ອັບເດດຂໍ້ມູນທີ່ກຳລັງເລືອກຢູ່ (ຖ້າມີການແກ້ໄຂລູກຄ້າຄົນນີ້ຢູ່)
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
          : item,
      ),
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
    0,
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
      {/* ສ່ວນສະແດງສິນຄ້າ */}
      <div className="flex-1 flex flex-col p-4 h-full overflow-hidden pt-18">
        {/* ແຖບຄົ້ນຫາ */}
        <div className="mb-6 shrink-0 relative max-w-md w-full mx-auto md:mx-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ຄົ້ນຫາສິນຄ້າທີ່ນີ້..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-gray-700 placeholder-gray-400"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* ບໍລິເວນສະແດງ Grid ສິນຄ້າ */}
        <div className="flex-1 overflow-y-auto pr-2 pb-16 lg:pb-4 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {products.map((p) => (
            <div
              key={p.product_id}
              onClick={() => addToCart(p)}
              className="bg-white p-2 rounded-2xl shadow-sm hover:shadow-md border border-transparent hover:border-orange-500 cursor-pointer transition-all h-fit"
            >
              <div className="h-28 bg-gray-50 rounded-xl mb-2 overflow-hidden flex items-center justify-center text-gray-300">
                {p.image ? (
                  <img
                    src={`http://localhost:3300/uploads/${p.image}`}
                    className="w-full h-full object-cover"
                    alt={p.product_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML =
                        '<i className="fas fa-image text-3xl"></i>';
                    }}
                  />
                ) : (
                  <i className="fas fa-image text-3xl text-gray-300"></i>
                )}
              </div>
              <p className="text-[10px] text-gray-600">{p.barcode}</p>
              <div className="h-10 overflow-hidden">
                <p className="font-bold text-[12px]">{p.product_name}</p>
              </div>
              <p className="text-orange-600 font-bold">
                {Number(p.sale_price).toLocaleString()} ₭
              </p>
              <p className="text-[10px] text-gray-400">stock: {p.stock_qty}</p>
            </div>
          ))}
        </div>
      </div>

      {showCartMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setShowCartMobile(false)}
        />
      )}

      {/* ສ່ວນກະຕ່າສິນຄ້າ */}
      <div
        className={`
        fixed top-0 right-0 h-screen w-full sm:w-96 bg-slate-50 border-l border-gray-200/80 shadow-2xl flex flex-col overflow-hidden z-40 transition-transform duration-300
        lg:static lg:flex lg:translate-x-0
        ${showCartMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header ກະຕ່າ */}
        <div className="p-4 bg-white border-b border-gray-100 font-bold text-lg flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
              <i className="fas fa-shopping-cart text-sm"></i>
            </div>
            <span>ກະຕ່າສິນຄ້າ</span>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-black">
                {totalCartItems} ຊິ້ນ
              </span>
            )}
            <button
              onClick={() => setShowCartMobile(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* ສ່ວນຄົ້ນຫາ ແລະ ຈັດການລູກຄ້າ */}
        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
              <b>ຂໍ້ມູນລູກຄ້າ</b>
            </label>
            {/* ປຸ່ມຈັດການລູກຄ້າຢູ່ຟາກຂວາ */}
            <button
              onClick={handleOpenAddModal}
              className="text-[11px] bg-orange-50 text-orange-600 hover:bg-orange-100 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
            >
              <i className="fas fa-user-plus"></i> ລູກຄ້າໃໝ່
            </button>
          </div>

          {selectedCustomerObj ? (
            <div className="flex justify-between items-center bg-linear-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl text-sm font-bold shadow-md shadow-orange-500/10 border border-orange-400/20 animate-fade-in">
              <div className="truncate flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <div className="truncate">
                  <p className="font-bold leading-tight">
                    {selectedCustomerObj.customer_name}
                  </p>
                  <span className="text-[11px] opacity-90 font-medium block mt-0.5">
                    <i className="fas fa-phone-alt text-[10px] mr-1"></i>
                    {selectedCustomerObj.phone || "ບໍ່ມີເບີໂທ"} • ID:{" "}
                    {selectedCustomerObj.customer_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerObj(null);
                  setCustomerSearch("");
                }}
                className="bg-white/20 hover:bg-white/30 text-white w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="ຄົ້ນຫາ ຊື່ / ເບີໂທ / ລະຫັດລູກຄ້າ..."
                className="w-full p-2.5 pl-9 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-sm transition-all text-gray-700 placeholder:text-gray-400"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
              />
              <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-xs"></i>

              {showCustomerDropdown && customerSearch && (
                <div className="absolute left-0 right-0 mt-2 border border-gray-100 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 text-sm p-1.5 backdrop-blur-xl bg-white/95">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.customer_id}
                        className="p-2.5 hover:bg-orange-50/60 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-150 group/item"
                      >
                        {/* ຄລິກເລືອກລູກຄ້າ */}
                        <div
                          className="flex items-center gap-2.5 flex-1"
                          onClick={() => {
                            setSelectedCustomerObj(cust);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">
                              {cust.customer_name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {cust.phone || "ບໍ່ມີເບີໂທ"}
                            </p>
                          </div>
                        </div>
                        {/* ປຸ່ມ ແກ້ໄຂ ແລະ ລຶບ ທີ່ຈະສະແດງໃນ Dropdown */}
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(cust);
                            }}
                            className="w-6 h-6 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg text-[10px] flex items-center justify-center transition-all"
                            title="ແກ້ໄຂ"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {cust.customer_id !== 1 && ( // ບໍ່ໃຫ້ລຶບລູກຄ້າທົ່ວໄປ ID 1
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomer(cust.customer_id);
                              }}
                              className="w-6 h-6 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] flex items-center justify-center transition-all"
                              title="ລຶບ"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-xs font-bold flex flex-col items-center gap-1">
                      <i className="fas fa-user-slash text-lg"></i>
                      <span>ບໍ່ພົບຂໍ້ມູນລູກຄ້າ</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ລາຍການສິນຄ້າໃນກະຕ່າ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 ContentScrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400/80 gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                <i className="fas fa-shopping-basket text-2xl"></i>
              </div>
              <p className="text-sm font-bold tracking-wide">ກະຕ່າວ່າງເປົ່າ</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between relative group hover:shadow-md hover:border-gray-200/60 transition-all duration-200"
              >
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="absolute top-3.5 right-3.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white w-6 h-6 rounded-lg text-[10px] flex items-center justify-center transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <div className="pr-6">
                  <p className="font-bold text-sm text-slate-800 truncate mb-3">
                    {item.product_name}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.qty - 1, item.stock_qty)
                      }
                      className="w-6 h-6 rounded-lg hover:bg-white text-gray-500 hover:text-orange-500 font-black transition-all flex items-center justify-center text-xs shadow-none hover:shadow-sm"
                    >
                      <i className="fas fa-minus text-[9px]"></i>
                    </button>
                    <span className="font-bold text-sm w-7 text-center text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.product_id, item.qty + 1, item.stock_qty)
                      }
                      className="w-6 h-6 rounded-lg hover:bg-white text-gray-500 hover:text-orange-500 font-black transition-all flex items-center justify-center text-xs shadow-none hover:shadow-sm"
                    >
                      <i className="fas fa-plus text-[9px]"></i>
                    </button>
                  </div>
                  <p className="font-black text-sm text-slate-800">
                    {Number(item.subtotal).toLocaleString()}{" "}
                    <span className="text-[10px] text-gray-400 font-normal">
                      ກີບ
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ສ່ວນຄິດໄລ່ເງິນ */}
        <div className="p-4 border-t border-gray-200/60 bg-white space-y-3.5 shrink-0 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 px-1">
            <span>ລວມເປັນເງິນ:</span>
            <span className="text-gray-700 text-sm font-black">
              {totalAmount.toLocaleString()} ກີບ
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 bg-gray-50/50 p-2.5 px-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <i className="fas fa-tag text-red-400 text-[10px]"></i>
              <span>ສ່ວນຫຼຸດ (ກີບ):</span>
            </div>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-32 p-1 text-right font-black text-red-500 outline-none bg-transparent border-b border-transparent focus:border-orange-500 text-sm transition-all placeholder:text-gray-300"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between items-end pt-1 px-1">
            <span className="font-bold text-sm text-gray-500 pb-0.5">
              ຍອດຊຳລະສຸດທິ:
            </span>
            <span className="text-2xl font-black text-orange-600 tracking-tight">
              {netAmount.toLocaleString()}{" "}
              <span className="text-xs font-bold text-orange-500">ກີບ</span>
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <i className="fas fa-wallet text-sm"></i>
            <span>ຊຳລະເງິນ</span>
          </button>
        </div>
      </div>

      {/* Floating Button ສໍາລັບມືຖື */}
      <button
        onClick={() => setShowCartMobile(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-linear-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl z-30 flex items-center justify-center gap-2 active:scale-95 transition-all"
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

      {/* Modal ຊຳລະເງິນ */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 bg-linear-to-br from-orange-500 to-amber-500 text-white text-center relative">
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

              {/* ສະແດງ UI ຕາມຊ່ອງທາງການຊຳລະ */}
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
                /* ກໍລະນີເລືອກ Credit (ຕິດໜີ້) */
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

              {/* ສະແດງຍອດສະຫຼຸບດ້ານລຸ່ມ */}
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

              {/* ປຸ່ມກົດ ຍົກເລີກ / ຢືນຢັນ */}
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

      {/* --- MODAL ສໍາລັບເພີ່ມ ແລະ ແກ້ໄຂຂໍ້ມູນລູກຄ້າ (CRUD) --- */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-scale-in">
            <div className="p-5 bg-linear-to-br from-slate-700 to-slate-900 text-white font-bold flex justify-between items-center">
              <h3>
                {isEditMode ? "📝 ແກ້ໄຂຂໍ້ມູນລູກຄ້າ" : "➕ ເພີ່ມລູກຄ້າໃໝ່"}
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
                <div>
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
                  บันທຶກ
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
