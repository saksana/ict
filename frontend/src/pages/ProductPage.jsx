import { useState, useEffect, useCallback, useRef } from "react";
import * as productApi from "../api/productApi";
import * as categoryApi from "../api/categoryApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const imageUrl = import.meta.env.VITE_IMG_URL;
// URL ສຳລັບສະແດງຮູບພາບ (ປັບຕາມ Server URL ຂອງທ່ານ)
//const IMAGE_BASE_URL = "http://localhost:3300/uploads";
const IMAGE_BASE_URL = imageUrl;

const ProductPage = () => {
  // --- 1. States Management ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    barcode: "",
    category_id: "",
    brand_name: "",
    product_name: "",
    serial_number: false,
    cost_price: 0,
    sale_price: 0,
    old_price: 0,
    //stock_qty: 0,
    detail: "",
    warranty: "",
    image: null, // ຮູບເກົ່າ ຫຼື string "null"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null); // File object ຈາກ input
  const [imagePreview, setImagePreview] = useState(null); // Preview URL

  // --- 2. Fetch Categories (ສຳລັບ Select Dropdown) ---
  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 3. Debounce Search Handler ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // --- 4. Data Fetching ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productApi.getProducts({
        search: debouncedSearch,
        category_id: selectedCategory || undefined,
        page,
        limit,
      });

      if (res.data) {
        const fetchedData = res.data.data || [];
        const pagInfo = res.data.pagination || {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
        };

        if (fetchedData.length === 0 && page > 1 && page > pagInfo.totalPages) {
          setPage(pagInfo.totalPages);
          return;
        }

        setProducts(fetchedData);
        setPagination(pagInfo);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 5. Form & Modal Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleOpenCreateModal = () => {
    setEditId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditId(product.product_id);
    setFormData({
      barcode: product.barcode || "",
      category_id: product.category_id || "",
      brand_name: product.brand_name || "",
      product_name: product.product_name || "",
      serial_number: Boolean(product.serial_number),
      cost_price: product.cost_price || 0,
      sale_price: product.sale_price || 0,
      old_price: product.old_price || 0,
      //stock_qty: product.stock_qty || 0,
      detail: product.detail || "",
      warranty: product.warranty || "",
      image: product.image || null,
    });
    setImageFile(null);
    setImagePreview(
      product.image ? `${IMAGE_BASE_URL}/${product.image}` : null,
    );
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.barcode.trim()) {
      toast.error("ກະລຸນາປ້ອນ Barcode!");
      return;
    }
    if (!formData.category_id) {
      toast.error("ກະລຸນາເລືອກໝວດໝູ່!");
      return;
    }
    if (!formData.product_name.trim()) {
      toast.error("ກະລຸນາປ້ອນຊື່ສິນຄ້າ!");
      return;
    }

    setIsSubmitting(true);

    // ສ້າງ FormData ເພື່ອສົ່ງ file + fields
    const data = new FormData();
    data.append("barcode", formData.barcode.trim());
    data.append("category_id", formData.category_id);
    data.append("brand_name", formData.brand_name.trim());
    data.append("product_name", formData.product_name.trim());
    data.append("serial_number", formData.serial_number);
    data.append("cost_price", formData.cost_price);
    data.append("sale_price", formData.sale_price);
    data.append("old_price", formData.old_price);
    //data.append("stock_qty", formData.stock_qty);
    data.append("detail", formData.detail.trim());
    data.append("warranty", formData.warranty.trim());

    if (imageFile) {
      // ກໍລະນີທີ 1: ມີການເລືອກຮູບໃໝ່
      data.append("image", imageFile);
    } else if (formData.image === null) {
      // ກໍລະນີທີ 2: ຜູ້ໃຊ້ກົດປຸ່ມ X ເພື່ອລຶບຮູບເກົ່າອອກ
      data.append("image", "null");
    } else {
      // ກໍລະນີທີ 3: ໃຊ້ຮູບເກົ່າ (ສົ່ງຊື່ຮູບເກົ່າໄປ Backend ເພື່ອບໍ່ໃຫ້ມັນລຶບ)
      data.append("image", formData.image);
    }

    try {
      if (editId) {
        const res = await productApi.updateProduct(editId, data);
        toast.success(res.data?.message || "ແກ້ໄຂສິນຄ້າສຳເລັດ!");
      } else {
        const res = await productApi.createProduct(data);
        toast.success(res.data?.message || "ເພີ່ມສິນຄ້າສຳເລັດ!");
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 6. Delete Handler (SweetAlert2) ---
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "ຢືນຢັນການລົບ?",
      text: `ທ່ານຕ້ອງການລົບສິນຄ້າ "${name}" ອອກຈາກລະບົບແທ້ບໍ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ລົບເລີຍ!",
      cancelButtonText: "ຍົກເລີກ",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl font-lao",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await productApi.deleteProduct(id);
        Swal.fire({
          title: "ລົບສຳເລັດ!",
          text: res.data?.message || "ຂໍ້ມູນຖືກລົບเรียบร້ອຍແລ້ວ.",
          icon: "success",
          confirmButtonColor: "#f97316",
          customClass: {
            popup: "rounded-2xl font-lao",
          },
        });
        fetchProducts();
      } catch (err) {
        toast.error(err.response?.data?.message || "ບໍ່ສາມາດລົບສິນຄ້າໄດ້");
      }
    }
  };

  // --- 7. Render UI ---
  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header ຫົວຂໍ້ */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-boxes"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">ລາຍການສິນຄ້າ</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ຈັດການລາຍການສິນຄ້າ, ລາຄາ ແລະ ສະຕັອກທັງໝົດໃນລະບົບ
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>ເພີ່ມສິນຄ້າໃໝ່</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={search}
            placeholder="ຄົ້ນຫາ Barcode, ຊື່ສິນຄ້າ, ແບຣນ..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm"
          >
            <option value="">-- ທຸກໝວດໝູ່ --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                  ຮູບ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Barcode / ຊື່ສິນຄ້າ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ໝວດໝູ່ / ແບຣນ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  ຕົ້ນທຶນ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  ລາຄາຂາຍ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  ສະຕັອກ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-28">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
                    ກຳລັງໂຫລດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    ບໍ່ພົບຂໍ້ມູນສິນຄ້າ
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      {product.image ? (
                        <img
                          src={`${IMAGE_BASE_URL}/${product.image}`}
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          <i className="fas fa-image text-lg"></i>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {product.barcode}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-medium mr-2">
                        {product.category_name || "ບໍ່ມີໝວດໝູ່"}
                      </span>
                      {product.brand_name && (
                        <span className="text-xs text-gray-500">
                          {product.brand_name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-gray-500 font-mono">
                      {Number(product.cost_price || 0).toLocaleString()} ₭
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800 font-mono">
                      {Number(product.sale_price || 0).toLocaleString()} ₭
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock_qty > 0
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {product.stock_qty || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ແກ້ໄຂ"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              product.product_id,
                              product.product_name,
                            )
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ລົບ"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-sm">
          <span className="text-gray-500 text-xs sm:text-sm">
            ທັງໝົດ <b>{pagination.totalItems}</b> ລາຍການ (ໜ້າ{" "}
            <b>{pagination.currentPage}</b> / <b>{pagination.totalPages}</b>)
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
            >
              ກ່ອນໜ້າ
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (pNum) =>
                  pNum === 1 ||
                  pNum === pagination.totalPages ||
                  Math.abs(pNum - page) <= 1,
              )
              .map((pageNum, index, array) => {
                const showEllipsis =
                  index > 0 && pageNum - array[index - 1] > 1;
                return (
                  <div key={pageNum} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="text-gray-400 px-1">...</span>
                    )}
                    <button
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                        page === pageNum
                          ? "bg-orange-500 text-white shadow-sm"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </div>
                );
              })}

            <button
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, pagination.totalPages))
              }
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
            >
              ຖັດໄປ
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form Setup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editId ? "ແກ້ໄຂຂໍ້ມູນສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່"}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSave}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Barcode */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    Barcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນ Barcode..."
                    required
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ໝວດໝູ່ສິນຄ້າ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">-- ເລືອກໝວດໝູ່ --</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ຊື່ສິນຄ້າ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນຊື່ສິນຄ້າ..."
                    required
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Brand Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ແບຣນສິນຄ້າ (Brand)
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນແບຣນສິນຄ້າ..."
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Warranty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ການຮັບປະກັນ
                  </label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="ເຊັ່ນ: 1 ປີ, 6 ເດືອນ..."
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Cost Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຄາຕົ້ນທຶນ
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Sale Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຄາຂາຍ
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Old Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຄາເກົ່າ (ສ່ວນຫຼຸດ)
                  </label>
                  <input
                    type="number"
                    name="old_price"
                    value={formData.old_price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Serial Number & Detail */}
                <div className="md:col-span-2 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer my-2">
                    <input
                      type="checkbox"
                      name="serial_number"
                      checked={formData.serial_number}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      ສິນຄ້ານີ້ມີ Serial Number (S/N)
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຍລະອຽດສິນຄ້າ
                  </label>
                  <textarea
                    name="detail"
                    rows="2"
                    value={formData.detail}
                    onChange={handleInputChange}
                    placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມ..."
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ຮູບພາບສິນຄ້າ
                  </label>

                  {/* Input File ແບບຊ່ອນໄວ້ (Hidden) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      /* ករណីມີຮູບ Preview */
                      <div className="relative w-24 h-24 rounded-2xl border border-gray-200 group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                        />

                        {/* ປຸ່ມລຶບຮູບ (X ສີແດງ) ຢູ່ gócຂວາເທິງ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // ປ້ອງກັນບໍ່ໃຫ້ມັນໄປ Trigger ເປີດເລືອກຮູບພາບ
                            handleRemoveImage();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                          title="ລຶບຮູບພາບ"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      /* ກໍລະນີບໍ່ທັນມີຮູບ (ກົດໃສ່ Box ນີ້ເພື່ອເລືອກຮູບໄດ້ເລີຍ) */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 cursor-pointer transition-all gap-1"
                      >
                        <i className="fas fa-cloud-upload-alt text-2xl"></i>
                        <span className="text-xs font-medium">ເລືອກຮູບ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end gap-3 shrink-0 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-all text-sm"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
                  {isSubmitting
                    ? "ກຳລັງບັນທຶກ..."
                    : editId
                      ? "ອັບເດດ"
                      : "ບັນທຶກ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
