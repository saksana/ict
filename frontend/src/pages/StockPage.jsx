import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

// ຕັ້ງຄ່າ Base URL
const API_URL = "http://localhost:3300/api";

export default function Stock() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("IN");

  // State ຟອມ ນຳເຂົ້າສິນຄ້າ
  const initialFormState = {
    product_id: "",
    supplier_id: "",
    quantity: 1,
    reference_no: "",
    comment: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Header Token
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Load ຂໍ້ມູນປະຫວັດ Stock, Product ແລະ Supplier
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resHistory, resProducts, resSuppliers] = await Promise.all([
        axios.get(`${API_URL}/stock/history`, getAuthHeader()),
        axios.get(`${API_URL}/products`, getAuthHeader()),
        axios.get(`${API_URL}/suppliers`, getAuthHeader()),
      ]);

      setHistory(resHistory.data || []);
      setProducts(resProducts.data || []);
      setSuppliers(resSuppliers.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສະຕັອກໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. ຈັດການ Input ໃນ Modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Submit ຟອມ Stock In
  const handleSubmitStockIn = async (e) => {
    e.preventDefault();

    if (!formData.product_id) {
      toast.error("ກະລຸນາເລືອກສິນຄ້າ!");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error("ກະລຸນາໃສ່ຈຳນວນໃຫ້ຖືກຕ້ອງ!");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        user_id: currentUser.user_id || 1,
      };

      const res = await axios.post(
        `${API_URL}/stock/in`,
        payload,
        getAuthHeader(),
      );

      if (res.data?.success) {
        Swal.fire({
          title: "ນຳເຂົ້າສະຕັອກສຳເລັດ!",
          text: res.data?.message || "ບັນທຶກການນຳເຂົ້າສະຕັອກຮຽບຮ້ອຍແລ້ວ",
          icon: "success",
          confirmButtonColor: "#f97316",
          customClass: {
            popup: "rounded-2xl font-lao",
          },
        });

        setIsModalOpen(false);
        setFormData(initialFormState);
        fetchData();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າສະຕັອກ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter ຂໍ້ມູນປະຫວັດ Stock
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.staff_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header ຫົວຂໍ້ (Theme ດຽວກັນກັບ Setting & Dashboard) */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-warehouse"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ຈັດການສະຕັອກສິນຄ້າ
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ບັນທຶກ ແລະ ກວດສອບປະຫວັດການເຄື່ອນໄຫວສະຕັອກສິນຄ້າທັງໝົດ
            </p>
          </div>
        </div>

        <Link
          to={"/imports"}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>ນຳເຂົ້າສິນຄ້າ</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="ຄົ້ນຫາຕາມຊື່ສິນຄ້າ, ເລກອ້າງອີງ, ຫຼື ຜູ້ບັນທຶກ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium w-full md:w-56"
          >
            
            <option value="IN">ນຳເຂົ້າ (Stock IN)</option>
            <option value="OUT">ນຳອອກ/ຂາຍ (Stock OUT)</option>
            <option value="ALL">ທຸກປະເພດ (All)</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-all active:scale-95 flex items-center justify-center shrink-0"
            title="ໂຫຼດຂໍ້ມູນໃໝ່"
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
          </button>
        </div>
      </div>

      {/* History Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">ປະຫວັດການເຄື່ອນໄຫວສະຕັອກ</h3>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            ທັງໝົດ {filteredHistory.length} ລາຍການ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ວັນທີ/ເວລາ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ເລກອ້າງອີງ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ຊື່ສິນຄ້າ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  ປະເພດ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  ຈຳນວນ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ຜູ້ສະໜອງ (Supplier)
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ຜູ້ບັນທຶກ
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ໝາຍເຫດ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
                    ກຳລັງໂຫຼດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    ບໍ່ພົບຂໍ້ມູນປະຫວັດການເຄື່ອນໄຫວ
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString("lo-LA")
                        : "-"}
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold text-orange-600 whitespace-nowrap">
                      {row.reference_no || "-"}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {row.product_name || "ບໍ່ລະບຸ"}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {row.type === "IN" ? (
                        <span className="inline-block bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          ↑ ນຳເຂົ້າ (IN)
                        </span>
                      ) : (
                        <span className="inline-block bg-rose-50 text-rose-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          ↓ ນຳອອກ (OUT)
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-4 text-right font-bold font-mono whitespace-nowrap ${
                        row.type === "IN" ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {row.type === "IN"
                        ? `+${row.quantity}`
                        : `-${row.quantity}`}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {row.supplier_name || "-"}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {row.staff_name || "-"}
                    </td>
                    <td className="p-4 text-xs text-gray-400 max-w-xs truncate">
                      {row.comment || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}