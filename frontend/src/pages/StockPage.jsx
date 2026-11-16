import React, { useState, useEffect, useCallback } from "react";
import * as stockApi from "../api/stockApi";
import * as productApi from "../api/productApi";
import * as importApi from "../api/importApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import ImportModal from "../components/ImportModal";

export default function Stock() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("IN");

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user.user_id || user.id || 1;

  const [importItems, setImportItems] = useState([
    {
      product_id: "",
      quantity: 1,
      comment: "",
      serial_number: [],
    },
  ]);

  const [activeSnIndex, setActiveSnIndex] = useState(null);
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);

  // --- 1. Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resHistory, resProducts] = await Promise.all([
        stockApi.getStockHistory(),
        productApi.getProducts({ limit: 1000 }),
      ]);

      // ຮັບ Data ໂດຍກົງຈາກ Service ທີ່ Extract .data ມາໃຫ້ແລ້ວ
      setHistory(resHistory?.data || resHistory || []);
      setProducts(resProducts?.data || resProducts || []);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString("lo-LA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleAddItem = () => {
    setImportItems((prev) => [
      ...prev,
      { product_id: "", quantity: 1, comment: "", serial_number: [] },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (importItems.length === 1) {
      toast.warning("ຕ້ອງມີຢ່າງໜ້ອຍ 1 ລາຍການສິນຄ້າ!");
      return;
    }
    setImportItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setImportItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "product_id") {
        const selectedProd = products.find(
          (p) => p.product_id.toString() === value.toString()
        );
        if (selectedProd && Number(selectedProd.serial_number) === 1) {
          const qty = Number(item.quantity) || 1;
          item.serial_number = Array(qty).fill("");
        } else {
          item.serial_number = [];
        }
      }

      if (field === "quantity") {
        const newQty = Math.max(1, Number(value) || 1);
        item.quantity = newQty;
        const selectedProd = products.find(
          (p) => p.product_id.toString() === item.product_id.toString()
        );
        if (selectedProd && Number(selectedProd.serial_number) === 1) {
          const currentSn = [...item.serial_number];
          if (newQty > currentSn.length) {
            while (currentSn.length < newQty) currentSn.push("");
          } else {
            currentSn.splice(newQty);
          }
          item.serial_number = currentSn;
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleOpenSnModal = (index) => {
    setActiveSnIndex(index);
    setIsSnModalOpen(true);
  };

  const handleSnChange = (snIndex, value) => {
    setImportItems((prev) => {
      const updated = [...prev];
      const snList = [...updated[activeSnIndex].serial_number];
      snList[snIndex] = value;
      updated[activeSnIndex].serial_number = snList;
      return updated;
    });
  };

  // --- 2. Submit Import (ແກ້ໄຂການຮັບ res message ໃຫ້ถูกต้อง) ---
  const handleSubmitImport = async (e) => {
    e.preventDefault();

    for (let i = 0; i < importItems.length; i++) {
      const item = importItems[i];
      if (!item.product_id) {
        toast.error(`ລາຍການທີ ${i + 1}: ກະລຸນາເລືອກສິນຄ້າ!`);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`ລາຍການທີ ${i + 1}: ຈຳນວນຕ້ອງຫຼາຍກວ່າ 0!`);
        return;
      }

      const selectedProd = products.find(
        (p) => p.product_id.toString() === item.product_id.toString()
      );
      if (selectedProd && Number(selectedProd.serial_number) === 1) {
        if (item.serial_number.some((sn) => !sn || !sn.trim())) {
          toast.error(`ລາຍການທີ ${i + 1}: ກະລຸນາປ້ອນ Serial Number ໃຫ້ຄົບທຸກໂຕ!`);
          return;
        }
      }
    }

    const result = await Swal.fire({
      title: "ຢືນຢັນການນຳເຂົ້າສິນຄ້າ?",
      text: `ທ່ານຕ້ອງການນຳເຂົ້າສິນຄ້າທັງໝົດ ${importItems.length} ລາຍການເຂົ້າສະຕັອກແທ້ບໍ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ຢືນຢັນນຳເຂົ້າ",
      cancelButtonText: "ຍົກເລີກ",
      customClass: { popup: "rounded-2xl font-lao" },
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    const payload = importItems.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      comment: item.comment.trim() || "",
      user_id: Number(currentUserId),
      serial_number: item.serial_number?.length > 0 ? item.serial_number : [],
    }));

    try {
      const res = await importApi.importProducts(payload);

      Swal.fire({
        title: "ນຳເຂົ້າສຳເລັດ!",
        text: res?.message || "ບັນທຶກການນຳເຂົ້າສິນຄ້າຮຽບຮ້ອຍແລ້ວ.",
        icon: "success",
        confirmButtonColor: "#f97316",
        customClass: { popup: "rounded-2xl font-lao" },
      });

      setIsImportModalOpen(false);
      setImportItems([
        { product_id: "", quantity: 1, comment: "", serial_number: [] },
      ]);
      fetchData();
    } catch (err) {
      console.error("Import error details:", err.response || err);
      toast.error(
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າສິນຄ້າ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Header */}
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

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>ນຳເຂົ້າສິນຄ້າ</span>
        </button>
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

      {/* History Table */}
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
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ວັນທີ/ເວລາ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ເລກອ້າງອີງ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ຊື່ສິນຄ້າ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ປະເພດ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ຈຳນວນ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ຜູ້ບັນທຶກ</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ໝາຍເຫດ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i> ກຳລັງໂຫຼດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    ບໍ່ພົບຂໍ້ມູນປະຫວັດການເຄື່ອນໄຫວ
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatDateTime(row.created_at)}
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
                    <td className={`p-4 text-right font-bold font-mono whitespace-nowrap ${row.type === "IN" ? "text-emerald-600" : "text-rose-500"}`}>
                      {row.type === "IN" ? `+${row.quantity}` : `-${row.quantity}`}
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

      {/* ImportModal Component */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleSubmitImport}
        isSubmitting={isSubmitting}
        importItems={importItems}
        products={products}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        handleItemChange={handleItemChange}
        handleOpenSnModal={handleOpenSnModal}
      />

      {/* Modal ປ້ອນ Serial Number */}
      {isSnModalOpen && activeSnIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsSnModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-20">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-gray-800">
                ກຳນົດ Serial Number (ລາຍການທີ {activeSnIndex + 1})
              </h3>
              <button
                type="button"
                onClick={() => setIsSnModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-gray-500">
                ກະລຸນາປ້ອນ Serial Number ໃຫ້ຄົບທັງໝົດ {importItems[activeSnIndex].quantity} ໂຕ:
              </p>
              {importItems[activeSnIndex].serial_number.map((sn, snIdx) => (
                <div key={snIdx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-6">#{snIdx + 1}</span>
                  <input
                    type="text"
                    value={sn}
                    onChange={(e) => handleSnChange(snIdx, e.target.value)}
                    placeholder={`ປ້ອນ Serial No ໂຕທີ ${snIdx + 1}...`}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setIsSnModalOpen(false)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all text-xs"
              >
                ບັນທຶກ Serial ໄວ້ຊົ່ວຄາວ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}