import { useState, useEffect, useCallback } from "react";
import * as supplierApi from "../api/supplierApi"; // Import helper API ຂອງ supplier
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SupplierPage = () => {
  // --- 1. States Management ---
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // States Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // Modal States & Form Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: "",
    phone: "",
    address: "",
    detail: "",
  });

  // --- 2. Debounce Search Handler ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // --- 3. Data Fetching ---
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await supplierApi.getSuppliers({
        search: debouncedSearch,
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

        setSuppliers(fetchedData);
        setPagination(pagInfo);
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນຜູ້ສະໜອງໄດ້");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // --- 4. Handlers ---
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ຈັດການການພິມເບີໂທ (ເອົາແຕ່ຕົວເລກ 0-9)
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const onlyNums = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      phone: onlyNums,
    }));
  };

  // ຈັດການການ Copy / Paste ເບີໂທ
  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const onlyNums = pastedData.replace(/[^0-9]/g, "").slice(0, 8);
    setFormData((prev) => ({
      ...prev,
      phone: onlyNums,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditId(null);
    setFormData({
      supplier_name: "",
      phone: "",
      address: "",
      detail: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setEditId(supplier.supplier_id);
    setFormData({
      supplier_name: supplier.supplier_name || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      detail: supplier.detail || "",
    });
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({
      supplier_name: "",
      phone: "",
      address: "",
      detail: "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.supplier_name.trim()) {
      toast.error("ກະລຸນາປ້ອນຊື່ຜູ້ສະໜອງ!");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("ກະລຸນາປ້ອນເບີໂທລະສັບ!");
      return;
    }

    if (formData.phone.length < 8) {
      toast.error("ກະລຸນາປ້ອນເບີໂທລະສັບໃຫ້ຄົບ 8 ຫຼັກ!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplier_name: formData.supplier_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        detail: formData.detail.trim() || null,
      };

      if (editId) {
        const res = await supplierApi.updateSupplier(editId, payload);
        toast.success(res.data?.message || "ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!");
      } else {
        const res = await supplierApi.createSupplier(payload);
        toast.success(res.data?.message || "ເພີ່ມຂໍ້ມູນຜູ້ສະໜອງສຳເລັດ!");
      }
      closeForm();
      fetchSuppliers();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "ຢືນຢັນການລົບ?",
      text: `ທ່ານຕ້ອງການລົບຂໍ້ມູນຜູ້ສະໜອງ "${name}" ອອກຈາກລະບົບແທ້ບໍ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Tailwind red-500
      cancelButtonColor: "#6b7280", // Tailwind gray-500
      confirmButtonText: "ລົບເລີຍ!",
      cancelButtonText: "ຍົກເລີກ",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl font-lao",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await supplierApi.deleteSupplier(id);

        Swal.fire({
          title: "ລົບສຳເລັດ!",
          text: res.data?.message || "ຂໍ້ມູນຖືກລົບเรียบร້ອຍແລ້ວ.",
          icon: "success",
          confirmButtonColor: "#f97316", // Tailwind orange-500
          customClass: {
            popup: "rounded-2xl font-lao",
          },
        });

        fetchSuppliers();
      } catch (err) {
        toast.error(
          err.response?.data?.message || "ບໍ່ສາມາດລົບຂໍ້ມູນຜູ້ສະໜອງໄດ້",
        );
      }
    }
  };

  // --- 5. Render UI ---
  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            ຈັດການຂໍ້ມູນຜູ້ສະໜອງ
          </h2>
          <p className="text-sm text-gray-500">
            ຈັດການລາຍຊື່, ເບີໂທ, ທີ່ຢູ່ ແລະ ລາຍລະອຽດຂອງຜູ້ສະໜອງທັງໝົດ
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2 font-medium"
        >
          <i className="fas fa-plus text-sm"></i>
          <span>ເພີ່ມຜູ້ສະໜອງໃໝ່</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={search}
            placeholder="ຄົ້ນຫາຊື່, ເບີໂທ ຫຼື ລາຍລະອຽດ..."
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
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ຊື່ຜູ້ສະໜອງ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ເບີໂທລະສັບ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ທີ່ຢູ່
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ລາຍລະອຽດ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-36">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
                    ກຳລັງໂຫລດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງ
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier.supplier_id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-gray-400 font-mono text-xs">
                      #{supplier.supplier_id}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {supplier.supplier_name}
                    </td>
                    <td className="p-4 text-gray-600 font-mono">
                      {supplier.phone || "-"}
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">
                      {supplier.address || "-"}
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">
                      {supplier.detail || "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ແກ້ໄຂ"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              supplier.supplier_id,
                              supplier.supplier_name,
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

      {/* Modal Setup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editId ? "ແກ້ໄຂຂໍ້ມູນຜູ້ສະໜອງ" : "ເພີ່ມຜູ້ສະໜອງໃໝ່"}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  ຊື່ຜູ້ສະໜອງ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  placeholder="ປ້ອນຊື່ຜູ້ສະໜອງ..."
                  required
                  autoFocus
                  className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              {/* ເບີໂທລະສັບ (ມີທຸງຊາດ + ລະຫັດ +85620 + ເອົາແຕ່ໂຕເລກ) */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  ເບີໂທລະສັບ <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all overflow-hidden">
                  <div className="flex items-center gap-1.5 pl-3 pr-2 text-sm text-gray-600 border-r border-gray-200 select-none whitespace-nowrap">
                    <span className="text-base">🇱🇦</span>
                    <span className="font-medium">020</span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onPaste={handlePhonePaste}
                    placeholder="ປ້ອນເບີໂທ 8 ໂຕເລກ..."
                    maxLength={8}
                    required
                    className="text-sm w-full p-3 bg-transparent outline-none border-none text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  ທີ່ຢູ່
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="ປ້ອນທີ່ຢູ່ຜູ້ສະໜອງ..."
                  className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  ລາຍລະອຽດເພີ່ມເຕີມ
                </label>
                <textarea
                  name="detail"
                  value={formData.detail}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມ..."
                  className="text-sm w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end gap-3 shrink-0">
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

export default SupplierPage;
