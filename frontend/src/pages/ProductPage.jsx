import { useState, useEffect } from "react";
import * as productApi from "../api/productApi";
import * as categoryApi from "../api/categoryApi";
import { toast } from "react-toastify";

const initialForm = {
  barcode: "",
  category_id: "",
  brand_name: "",
  product_name: "",
  serial_number: "",
  cost_price: 0,
  sale_price: 0,
  stock_qty: 0,
  detail: "",
};

const ProductPage = () => {
  // --- 1. States Management ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  // States ດຶງຂໍ້ມູນ Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- 2. Data Fetching ---

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // ສົ່ງ params ໄປຫາ API
      const res = await productApi.getProducts({ search, page, limit });
      
      // Backend ສົ່ງ Response structure ເປັນ { pagination: {...}, data: [...] }
      if (res.data) {
        setProducts(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page, limit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 3. Handlers ---

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset ໄປໜ້າ 1 ເມື່ອມີການຄົ້ນຫາ
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // ເຮັດ Preview ໄດ້ໄວ ແລະ ມີປະສິດທິພາບ
    }
  };

  const handleEdit = (product) => {
    setEditId(product.product_id);
    setFormData({
      barcode: product.barcode || "",
      category_id: product.category_id || "",
      brand_name: product.brand_name || "",
      product_name: product.product_name || "",
      serial_number: product.serial_number || "",
      cost_price: product.cost_price || 0,
      sale_price: product.sale_price || 0,
      stock_qty: product.stock_qty || 0,
      detail: product.detail || "",
    });
    setImagePreview(
      product.image ? `http://localhost:3300/uploads/${product.image}` : null
    );
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData(initialForm);
    setImage(null);
    setImagePreview(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (image) data.append("image", image);

    try {
      if (editId) {
        await productApi.updateProduct(editId, data);
        toast.success("ແກ້ໄຂຂໍ້ມູນສຳເລັດ");
      } else {
        await productApi.createProduct(data);
        toast.success("ບັນທຶກສິນຄ້າສຳເລັດ");
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      // ດຶງຂໍ້ຄວາມ Error ຈາກ Backend ມາສະແດງ (ເຊັ່ນ: Barcode ຊໍ້າ)
      toast.error(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`ຢືນຢັນການລຶບສິນຄ້າ: ${name}?`)) {
      try {
        await productApi.deleteProduct(id);
        toast.success("ລຶບສິນຄ້າສຳເລັດ");
        fetchProducts();
      } catch (err) {
        toast.error(err.response?.data?.message || "ບໍ່ສາມາດລຶບສິນຄ້າໄດ້");
      }
    }
  };

  // --- 4. Render UI ---
  return (
    <div className="pt-16 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ຄັງສິນຄ້າ</h2>
          <p className="text-sm text-gray-500">
            ຈັດການລາຍການສິນຄ້າ ແລະ ສະຕັອກຂອງທ່ານ
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2 font-medium"
        >
          <i className="fas fa-plus text-sm"></i>
          <span>ເພີ່ມສິນຄ້າໃໝ່</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={search}
            placeholder="ຄົ້ນຫາດ້ວຍຊື່, ແບຣນ ຫຼື ບາໂຄດ..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-sm"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ຮູບ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ລາຍລະອຽດສິນຄ້າ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ປະເພດ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ລາຄາຂາຍ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  ຄົງເຫຼືອ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    ກຳລັງໂຫລດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
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
                      <ProductImage src={product.image} name={product.product_name} />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                        <span>Barcode: {product.barcode}</span>
                        {product.brand_name && <span>| ແບຣນ: {product.brand_name}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {product.category_name || "-"}
                    </td>
                    <td className="p-4 text-orange-600 font-bold">
                      {Number(product.sale_price).toLocaleString()} ກີບ
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          product.stock_qty <= 5
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {product.stock_qty} ຊິ້ນ
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
                            handleDelete(product.product_id, product.product_name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ລຶບ"
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

        {/* Pagination Controls Section */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-sm">
            <span className="text-gray-500 text-xs sm:text-sm">
              ທັງໝົດ <b>{pagination.totalItems}</b> ລາຍການ (ໜ້າ <b>{pagination.currentPage}</b> / <b>{pagination.totalPages}</b>)
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
                    Math.abs(pNum - page) <= 1
                )
                .map((pageNum, index, array) => {
                  const showEllipsis =
                    index > 0 && pageNum - array[index - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center gap-1">
                      {showEllipsis && <span className="text-gray-400 px-1">...</span>}
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
                disabled={page === pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
              >
                ຖັດໄປ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Setup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-800">
                {editId ? "ແກ້ໄຂຂໍ້ມູນສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່"}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fas fa-times text-gray-400"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-white">
              <form
                id="product-form"
                onSubmit={handleSave}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="ບາໂຄດ"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      ປະເພດສິນຄ້າ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                      <option value="">-- ເລືອກປະເພດ --</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <FormInput
                  label="ຊື່ສິນຄ້າ"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="ແບຣນ"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="S/N"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormInput
                    label="ລາຄາທຶນ"
                    name="cost_price"
                    type="number"
                    value={formData.cost_price}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="ລາຄາຂາຍ"
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="ສະຕັອກ"
                    name="stock_qty"
                    type="number"
                    value={formData.stock_qty}
                    onChange={handleChange}
                  />
                </div>

                {/* Image Upload Area */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    ຮູບພາບ
                  </label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-orange-400 transition-colors bg-gray-50 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          className="h-32 mx-auto rounded-lg shadow-sm object-cover"
                          alt="Preview"
                        />
                        <p className="text-xs text-gray-400 mt-2">ຄລິກເພື່ອປ່ຽນຮູບພາບ</p>
                      </div>
                    ) : (
                      <div className="py-4 text-gray-400">
                        <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                        <p className="text-xs">ຄລິກເພື່ອເລືອກຮູບພາບ</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    ລາຍລະອຽດ
                  </label>
                  <textarea
                    name="detail"
                    value={formData.detail}
                    rows="3"
                    className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    onChange={handleChange}
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-500 font-medium hover:bg-gray-200 rounded-xl transition-all text-sm"
              >
                ຍົກເລີກ
              </button>
              <button
                form="product-form"
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 text-sm disabled:opacity-50"
              >
                {isSubmitting
                  ? "ກຳລັງບັນທຶກ..."
                  : editId
                  ? "ອັບເດດຂໍ້ມູນ"
                  : "ບັນທຶກສິນຄ້າ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component ສຳລັບຈັດການຮູບພາບໃນຕາຕະລາງແບບປອດໄພ
const ProductImage = ({ src, name }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-14 h-14 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={`http://localhost:3300/uploads/${src}`}
      alt={name}
      onError={() => setHasError(true)}
      className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm"
    />
  );
};

// Custom Form Input Component
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      required={required}
      onChange={onChange}
      className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
      placeholder={`ປ້ອນ${label}...`}
    />
  </div>
);

export default ProductPage;