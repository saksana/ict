import React, { useState, useEffect, useRef } from "react";
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
import CustomerDebtModal from "../components/sale/CustomerDebtModal"; // 🟢 1. ນຳເຂົ້າ Modal ຈັດການໜີ້ສິນ
//print
import InvoiceA4 from "../components/InvoiceA4";
import QuotationA4 from "../components/QuotationA4";

const SalePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
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
  const receiptRef = useRef(null);

  // --- Modal ປະຫວັດການຂາຍ ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // --- 🟢 2. State ສຳລັບ Modal ຈັດການໜີ້ສິນລູກຄ້າ ---
  const [showDebtModal, setShowDebtModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

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
          cust.customer_id.toString() === customerSearch,
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
    setIsLoading(true);
    try {
      const res = await productApi.getAllProducts({
        search,
        category_id: selectedCategory || null,
      });
      setProducts(res.data.data || res.data);
    } catch (err) {
      toast.error("ໂຫລດສິນຄ້າບໍ່ສຳເລັດ");
    } finally {
      setIsLoading(false);
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

  const handleOpenHistoryModal = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrdersHistory(res.data || []);
      setShowHistoryModal(true);
    } catch (err) {
      toast.error("ບໍ່ສາມາດໂຫລດປະຫວັດການຂາຍໄດ້");
    }
  };

  const filteredOrders = ordersHistory.filter((order) => {
    const orderDateStr = order.created_at || order.order_date;
    if (!orderDateStr) return false;
    return orderDateStr.startsWith(filterDate);
  });

  const handlePrintExistingOrder = async (order) => {
    const customerObj =
      customers.find((c) => c.customer_id === order.customer_id) || null;
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
        : 1, // 1 ໝາຍເຖິງລູກຄ້າທົ່ວໄປ
      user_id: user ? user.id : 1, // 🟢 ກວດສອບປ້ອງກັນກໍລະນີ user ເປັນ null
      total_amount: Number(totalAmount) || 0,
      discount: Number(discount) || 0,
      net_amount: Number(netAmount) || 0,
      status: paymentMethod === "credit" ? "PENDING" : "COMPLETE",
      updated_by: user ? user.id : 1, // 🟢 ກວດສອບປ້ອງກັນກໍລະນີ user ເປັນ null
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
      if (res.status === 201) {
        toast.success(res.data.message);
        const createdOrder = res.data.order || orderData;

        await setPrintData({
          orderData: createdOrder,
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
        user_id: user.id,
        cancel_reason: reason.trim(),
      });

      toast.success(res.data.message || "ຍົກເລີກບິນສຳເລັດ!");

      handleOpenHistoryModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "ບໍ່ສາມາດຍົກເລີກບິນໄດ້");
    }
  };

  const [quotationPrintData, setQuotationPrintData] = useState(null);
  const quotationRef = useRef(null);

  const handlePrintQuotation = useReactToPrint({
    contentRef: quotationRef,
    documentTitle: "Quotation-A4",
  });

  const onOpenQuotation = async () => {
    if (cart.length === 0)
      return toast.warning("ກະລຸນາເລືອກສິນຄ້າໃສ່ກະຕ່າກ່ອນ!");

    const qData = {
      quotation_no: "QT-" + Math.floor(100000 + Math.random() * 900000),
      created_at: new Date().toISOString(),
      total_amount: totalAmount,
      discount: Number(discount),
      net_amount: netAmount,
    };

    await setQuotationPrintData({
      quotationData: qData,
      customer: selectedCustomerObj,
      cartItems: [...cart],
    });

    setTimeout(() => {
      handlePrintQuotation();
    }, 300);
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
        onOpenDebtModal={() => setShowDebtModal(true)} // 🟢 3. ສົ່ງ prop ເປີດ Modal ຈັດການໜີ້ໄປໃຫ້ Cart
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

      {/* 🟢 4. Render Modal ຈັດການໜີ້ສິນລູກຄ້າ */}
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
