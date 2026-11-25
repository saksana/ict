import React, { useState, useEffect, useRef, useMemo } from "react";
import * as productApi from "../api/productApi";
import * as orderApi from "../api/orderApi";
import * as customerApi from "../api/customerApi";
import * as categoryApi from "../api/categoryApi";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import Swal from "sweetalert2";

// ນຳເຂົ້າ Modals ທີ່ແຍກອອກມາ
import OrderHistoryModal from "../components/sale/OrderHistoryModal";
import PaymentModal from "../components/sale/PaymentModal";
import CustomerModal from "../components/sale/CustomerModal";
import CustomerDebtModal from "../components/sale/CustomerDebtModal";

// Print
import InvoiceA4 from "../components/InvoiceA4";
import QuotationA4 from "../components/QuotationA4";

const SalePage = () => {
  const [user] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // --- ລະບົບລູກຄ້າ ---
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // --- CRUD ລູກຄ້າ ---
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
  const [shouldPrintInvoice, setShouldPrintInvoice] = useState(false);
  const receiptRef = useRef(null);

  // --- Modal ປະຫວັດການຂາຍ ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [filterDate, setFilterDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // --- State ສຳລັບ Modal ຈັດການໜີ້ສິນລູກຄ້າ ---
  const [showDebtModal, setShowDebtModal] = useState(false);

  // --- State ສຳລັບພິມໃບສະເໜີລາຄາ ---
  const [quotationPrintData, setQuotationPrintData] = useState(null);
  const [shouldPrintQuotation, setShouldPrintQuotation] = useState(false);
  const quotationRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch {
      console.error("ໂຫລດປະເພດສິນຄ້າບໍ່ສຳເລັດ");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.getCustomers();
      setCustomers(res.data?.data || res.data || []);
    } catch {
      toast.error("ໂຫລດຂໍ້ມູນລູກຄ້າບໍ່ສຳເລັດ");
    }
  };

  const fetchProducts = async (searchTerm = search, catId = selectedCategory) => {
    setIsLoading(true);
    try {
      const res = await productApi.getAllProducts({
        search: searchTerm,
        category_id: catId || null,
      });
      setProducts(res.data?.data || res.data || []);
    } catch {
      toast.error("ໂຫລດສິນຄ້າບໍ່ສຳເລັດ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  useEffect(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) {
      setFilteredCustomers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = customers.filter(
        (cust) =>
          (cust.customer_name || "").toLowerCase().includes(q) ||
          (cust.phone && String(cust.phone).includes(customerSearch.trim())) ||
          String(cust.customer_id) === customerSearch.trim(),
      );
      setFilteredCustomers(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, customers]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Invoice-Receipt",
  });

  const handlePrintQuotation = useReactToPrint({
    contentRef: quotationRef,
    documentTitle: "Quotation-A4",
  });

  useEffect(() => {
    if (shouldPrintInvoice && printData && receiptRef.current) {
      handlePrint();
      setShouldPrintInvoice(false);
    }
  }, [shouldPrintInvoice, printData, handlePrint]);

  useEffect(() => {
    if (shouldPrintQuotation && quotationPrintData && quotationRef.current) {
      handlePrintQuotation();
      setShouldPrintQuotation(false);
    }
  }, [shouldPrintQuotation, quotationPrintData, handlePrintQuotation]);

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
    if (!custForm.customer_name.trim() || !custForm.phone.trim()) {
      return toast.warning("ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ!");
    }
    try {
      if (isEditMode) {
        const res = await customerApi.updateCustomer(editingCustId, custForm);
        toast.success(res.data?.message || res.message || "ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ!");
        if (
          selectedCustomerObj &&
          selectedCustomerObj.customer_id === editingCustId
        ) {
          setSelectedCustomerObj({ ...selectedCustomerObj, ...custForm });
        }
      } else {
        const res = await customerApi.createCustomer(custForm);
        toast.success(res.data?.message || res.message || "ເພີ່ມຂໍ້ມູນລູກຄ້າສຳເລັດ!");
      }
      setShowCustModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລູກຄ້າຄົນນີ້?")) return;
    try {
      const res = await customerApi.deleteCustomer(id);
      toast.success(res.data?.message || res.message || "ລຶບລູກຄ້າສຳເລັດ!");
      if (selectedCustomerObj && selectedCustomerObj.customer_id === id) {
        setSelectedCustomerObj(null);
        setCustomerSearch("");
      }
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "ບໍ່ສາມາດລຶບໄດ້");
    }
  };

  const handleOpenHistoryModal = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrdersHistory(res.data?.data || res.data || []);
      setShowHistoryModal(true);
    } catch {
      toast.error("ບໍ່ສາມາດໂຫລດປະຫວັດການຂາຍໄດ້");
    }
  };

  const filteredOrders = useMemo(() => {
    return ordersHistory.filter((order) => {
      const orderDateStr = order.created_at || order.order_date;
      if (!orderDateStr) return false;
      return String(orderDateStr).startsWith(filterDate);
    });
  }, [ordersHistory, filterDate]);

  const handlePrintExistingOrder = (order) => {
    const customerObj =
      customers.find((c) => c.customer_id === order.customer_id) || null;
    setPrintData({
      orderData: order,
      customer: customerObj,
      cartItems: order.items || [],
    });
    setShouldPrintInvoice(true);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.product_id !== id));
  };

  const updateQty = (productId, newQty, stockQty) => {
    const qtyNum = Number(newQty);
    if (qtyNum < 1) {
      removeFromCart(productId);
      return;
    }
    if (qtyNum > Number(stockQty)) {
      toast.warning("ສິນຄ້າໃນສະຕັອກບໍ່ພໍ!");
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              qty: qtyNum,
              subtotal: qtyNum * Number(item.unit_price),
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
      setCart((prev) => [
        ...prev,
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

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [cart],
  );

  const netAmount = useMemo(() => {
    const diff = totalAmount - Number(discount || 0);
    return diff > 0 ? diff : 0;
  }, [totalAmount, discount]);

  const changeAmount = useMemo(
    () => Number(amountPaid || 0) - netAmount,
    [amountPaid, netAmount],
  );

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [cart],
  );

  const handleConfirmOrder = async () => {
    if (paymentMethod === "cash" && Number(amountPaid) < netAmount) {
      return toast.warning("ເງິນທີ່ຮັບມາບໍ່ພໍ!");
    }

    const orderData = {
      customer_id: selectedCustomerObj
        ? Number(selectedCustomerObj.customer_id)
        : 1,
      user_id: user ? user.id : 1,
      fullname: user ? user.fullname : "-",
      total_amount: Number(totalAmount) || 0,
      discount: Number(discount) || 0,
      net_amount: Number(netAmount) || 0,
      status: paymentMethod === "credit" ? "PENDING" : "COMPLETE",
      updated_by: user ? user.id : 1,
      payment_method: paymentMethod,
      amount_paid:
        paymentMethod === "cash"
          ? Number(amountPaid) || 0
          : paymentMethod === "credit"
            ? 0
            : Number(netAmount),
      change_amount:
        paymentMethod === "cash" && changeAmount > 0 ? Number(changeAmount) : 0,
      payment_status: paymentMethod === "credit" ? "unpaid" : "paid",
      items: cart.map((item) => ({
        product_id: item.product_id,
        qty: Number(item.qty),
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      })),
    };

    try {
      const res = await orderApi.createOrder(orderData);
      const payload = res.data || res;
      if (payload.success === true || res.status === 200 || res.status === 201) {
        toast.success(payload.message || "ບັນທຶກການຂາຍແລ້ວ");
        const createdOrder = payload.order || orderData;

        setPrintData({
          orderData: createdOrder,
          customer: selectedCustomerObj,
          cartItems: [...cart],
        });
        setShouldPrintInvoice(true);

        setCart([]);
        setAmountPaid(0);
        setDiscount(0);
        setSelectedCustomerObj(null);
        setCustomerSearch("");
        setShowPaymentModal(false);
        setShowCartMobile(false);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      text: "ຍົກເລີກບິນ?",
      icon: "warning",
      input: "text",
      inputPlaceholder: "ປ້ອນເຫດຜົນການຍົກເລີກ...",
      inputAttributes: {
        style:
          "border: 2px solid #ef4444 !important; box-shadow: none !important; outline: none !important;",
      },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ຢືນຢັນຍົກເລີກ",
      cancelButtonText: "ປິດ",
      reverseButtons: true,
      customClass: {
        popup: "rounded-xl font-lao",
        input: "focus:ring-0",
      },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "ກະລຸນາລະບຸເຫດຜົນໃນການຍົກເລີກກ່ອນ!";
        }
      },
    });

    if (!isConfirmed) return;

    try {
      const res = await orderApi.cancelOrder(orderId, {
        user_id: user?.id,
        cancel_reason: reason.trim(),
      });

      toast.success(res.data?.message || res.message || "ຍົກເລີກບິນສຳເລັດ!");

      setOrdersHistory((prev) =>
        prev.map((o) =>
          (o.order_id ?? o.id) === orderId
            ? { ...o, status: "CANCELLED", cancel_reason: reason.trim() }
            : o,
        ),
      );
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "ບໍ່ສາມາດຍົກເລີກບິນໄດ້");
    }
  };

  const onOpenQuotation = () => {
    if (cart.length === 0) {
      return toast.warning("ກະລຸນາເລືອກສິນຄ້າໃສ່ກະຕ່າກ່ອນ!");
    }

    const qData = {
      quotation_no: "QT-" + Math.floor(100000 + Math.random() * 900000),
      created_at: new Date().toISOString(),
      total_amount: totalAmount,
      discount: Number(discount),
      net_amount: netAmount,
    };

    setQuotationPrintData({
      quotationData: qData,
      customer: selectedCustomerObj,
      cartItems: [...cart],
    });
    setShouldPrintQuotation(true);
  };

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
        isLoading={isLoading}
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
        handlePrintQuotation={handlePrintQuotation}
        onOpenQuotation={onOpenQuotation}
        onOpenDebtModal={() => setShowDebtModal(true)}
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

      {/* --- Modals ທີ່ຖືກແຍກອອກໄປ --- */}
      <OrderHistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filteredOrders={filteredOrders}
        handlePrintExistingOrder={handlePrintExistingOrder}
        handleCancelOrder={handleCancelOrder}
      />

      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        netAmount={netAmount}
        discount={discount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        changeAmount={changeAmount}
        handleConfirmOrder={handleConfirmOrder}
        selectedCustomerObj={selectedCustomerObj}
      />

      <CustomerModal
        show={showCustModal}
        onClose={() => setShowCustModal(false)}
        isEditMode={isEditMode}
        custForm={custForm}
        setCustForm={setCustForm}
        handleSaveCustomer={handleSaveCustomer}
      />

      <CustomerDebtModal
        show={showDebtModal}
        onClose={() => setShowDebtModal(false)}
      />

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

      {/* ສ່ວນຊ່ອນ Component ໃບສະເໜີລາຄາ A4 ໄວ້ສັ່ງພິມ */}
      <div className="hidden">
        {quotationPrintData && (
          <QuotationA4
            ref={quotationRef}
            quotationData={quotationPrintData.quotationData}
            customer={quotationPrintData.customer}
            cartItems={quotationPrintData.cartItems}
          />
        )}
      </div>
    </div>
  );
};

export default SalePage;