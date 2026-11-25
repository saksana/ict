import { useState, useEffect, useCallback, useRef } from "react";
import * as productApi from "../api/productApi";
import * as categoryApi from "../api/categoryApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const imageUrl = import.meta.env.VITE_IMG_URL;
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

  // --- 🟢 States ສຳລັບ Modal ຈັດການໝວດໝູ່ຍ່ອຍ ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const initialFormState = {
    barcode: "",
    category_id: "",
    brand_name: "",
    product_name: "",
    serial_number: false,
    cost_price: 0,
    sale_price: 0,
    old_price: 0,
    detail: "",
    warranty: "",
    image: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- 2. Fetch Categories ---
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

  // --- 🟢 ຟັງຊັນເພີ່ມ ແລະ ລົບໝວດໝູ່ ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      return toast.warning("ກະລຸນາປ້ອນຊື່ໝວດໝູ່!");
    }

    setIsCategorySubmitting(true);
    try {
      const res = await categoryApi.createCategory({ category_name: newCategoryName.trim() });
      toast.success(res.data?.message || "ເພີ່ມໝວດໝູ່ສຳເລັດ!");
      setNewCategoryName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "ບໍ່ສາມາດເພີ່ມໝວດໝູ່ໄດ້");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    const result = await Swal.fire({
      title: "ຢືນຢັນການລົບໝວດໝູ່?",
      text: `ທ່ານຕ້ອງການລົບໝວດໝູ່ "${catName}" ແທ້ບໍ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ລົບເລີຍ!",
      cancelButtonText: "ຍົກເລີກ",
      reverseButtons: true,
      customClass: { popup: "rounded-2xl font-lao" },
    });

    if (result.isConfirmed) {
      try {
        const res = await categoryApi.deleteCategory(catId);
        toast.success(res.data?.message || "ລົບໝວດໝູ່ສຳເລັດ!");
        if (formData.category_id.toString() === catId.toString()) {
          setFormData((prev) => ({ ...prev, category_id: "" }));
        }
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || "ບໍ່ສາມາດລົບໝວດໝູ່ໄດ້ (ອາດມີສິນຄ້າກ່ຽວຂ້ອງຢູ່)");
      }
    }
  };

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

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "cost_price" || name === "sale_price" || name === "old_price") {
      const rawValue = value.replace(/,/g, "");
      if (rawValue === "" || !isNaN(rawValue)) {
        setFormData((prev) => ({
          ...prev,
          [name]: rawValue === "" ? 0 : Number(rawValue),
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const data = new FormData();
    data.append("barcode", formData.barcode.trim());
    data.append("category_id", formData.category_id);
    data.append("brand_name", formData.brand_name.trim());
    data.append("product_name", formData.product_name.trim());
    data.append("serial_number", formData.serial_number);
    data.append("cost_price", formData.cost_price);
    data.append("sale_price", formData.sale_price);
    data.append("old_price", formData.old_price);
    data.append("detail", formData.detail.trim());
    data.append("warranty", formData.warranty.trim());

    if (imageFile) {
      data.append("image", imageFile);
    } else if (formData.image === null) {
      data.append("image", "null");
    } else {
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
      customClass: { popup: "rounded-2xl font-lao" },
    });

    if (result.isConfirmed) {
      try {
        const res = await productApi.deleteProduct(id);
        Swal.fire({
          title: "ລົບສຳເລັດ!",
          text: res.data?.message || "ຂໍ້ມູນຖືກລົບຮຽບຮ້ອຍແລ້ວ.",
          icon: "success",
          confirmButtonColor: "#f97316",
          customClass: { popup: "rounded-2xl font-lao" },
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
                    <i className="fas fa-spinner fa-spin mr-2"></i> ກຳລັງໂຫລດຂໍ້ມູນ...
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

      {/* --- 🟢 Modal ຈັດການໝວດໝູ່ (Categories Modal) --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCategoryModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">ຈັດການໝວດໝູ່ສິນຄ້າ</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Form ເພີ່ມໝວດໝູ່ໃໝ່ */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ຊື່ໝວດໝູ່ໃໝ່..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                >
                  <i className="fas fa-plus"></i> ເພີ່ມ
                </button>
              </form>

              {/* List ສະແດງໝວດໝູ່ທີ່ມີຢູ່ */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <p className="p-4 text-center text-xs text-gray-400">ຍັງບໍ່ມີໝວດໝູ່</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.category_id} className="flex items-center justify-between p-3 hover:bg-gray-50/50">
                      <span className="text-sm font-bold text-gray-700">{cat.category_name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.category_id, cat.category_name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs"
                        title="ລົບໝວດໝູ່"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Setup (ເພີ່ມ/ແກ້ໄຂສິນຄ້າ) */}
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
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-gray-700">
                      ໝວດໝູ່ສິນຄ້າ <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      <i className="fas fa-cog"></i> ຈັດການໝວດໝູ່
                    </button>
                  </div>

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
                    type="text"
                    name="cost_price"
                    value={
                      formData.cost_price
                        ? Number(formData.cost_price).toLocaleString()
                        : ""
                    }
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                  />
                </div>

                {/* Sale Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຄາຂາຍ
                  </label>
                  <input
                    type="text"
                    name="sale_price"
                    value={
                      formData.sale_price
                        ? Number(formData.sale_price).toLocaleString()
                        : ""
                    }
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                  />
                </div>

                {/* Old Price */}
                <div className="space-y-1 hidden">
                  <label className="text-xs font-semibold text-gray-700 ml-1">
                    ລາຄາເກົ່າ (ສ່ວນຫຼຸດ)
                  </label>
                  <input
                    type="text"
                    name="old_price"
                    value={
                      formData.old_price
                        ? Number(formData.old_price).toLocaleString()
                        : ""
                    }
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono"
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

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-24 h-24 rounded-2xl border border-gray-200 group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                          title="ລຶບຮູບພາບ"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ) : (
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