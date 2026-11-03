import { useState, useEffect, useCallback } from "react";
import * as productApi from "../api/productApi";
import * as importApi from "../api/importApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ImportPage = () => {
  // --- 1. States Management ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user.id;

  const [importItems, setImportItems] = useState([
    {
      product_id: "",
      quantity: 1,
      comment: "",
      serial_number: [], // Array ຂອງ S/N ຖ້າສິນຄ້ານັ້ນຕ້ອງການ
    },
  ]);

  // Modal ສຳລັບຈັດການ Serial Numbers ແຕ່ລະລາຍການ
  const [activeSnIndex, setActiveSnIndex] = useState(null);
  const [tempSerialInput, setTempSerialInput] = useState("");
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);

  // --- 2. Fetch Products ສຳລັບ Dropdown ເລືອກສິນຄ້າ ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // ດຶງສິນຄ້າທັງໝົດແບບບໍ່ pagination ຫຼື limit ຫຼາຍພໍສຳລັບ Dropdown
      const res = await productApi.getProducts({ limit: 100 });
      if (res.data) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 3. Item Row Handlers ---
  const handleAddItem = () => {
    setImportItems((prev) => [
      ...prev,
      {
        product_id: "",
        quantity: 1,
        comment: "",
        serial_number: [],
      },
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

      // ຖ້າປ່ຽນ product_id ໃຫ້ກວດເບິ່ງວ່າສິນຄ້ານັ້ນຕ້ອງການ Serial Number ບໍ
      if (field === "product_id") {
        const selectedProd = products.find(
          (p) => p.product_id.toString() === value.toString(),
        );
        if (selectedProd && Number(selectedProd.serial_number) === 1) {
          // ຖ້າຕ້ອງການ S/N, ໃຫ້ກະກຽມ Array ໃຫ້ົງກັບ Quantity ປັດຈຸບັນ
          const qty = Number(item.quantity) || 1;
          item.serial_number = Array(qty).fill("");
        } else {
          item.serial_number = [];
        }
      }

      // ຖ້າປ່ຽນ quantity ແລະ ສິນຄ້ານີ້ໃຊ້ S/N ໃຫ້ປັບຂະໜາດ Array ຂອງ S/N ຕາມ
      if (field === "quantity") {
        const newQty = Math.max(1, Number(value) || 1);
        item.quantity = newQty;
        const selectedProd = products.find(
          (p) => p.product_id.toString() === item.product_id.toString(),
        );
        if (selectedProd && Number(selectedProd.serial_number) === 1) {
          const currentSn = [...item.serial_number];
          if (newQty > currentSn.length) {
            // ເພີ່ມช่องຫວ່າງ S/N
            while (currentSn.length < newQty) currentSn.push("");
          } else {
            // ตัดອອກຖ້າຈຳນວນນ້ອຍລົງ
            currentSn.splice(newQty);
          }
          item.serial_number = currentSn;
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  // --- 4. Serial Number Modal Handlers ---
  const handleOpenSnModal = (index) => {
    setActiveSnIndex(index);
    setIsSnModalOpen(true);
  };

  const handleCloseSnModal = () => {
    setIsSnModalOpen(false);
    setActiveSnIndex(null);
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

  // --- 5. Submit Handler (Save Import) ---
  const handleSubmitImport = async (e) => {
    e.preventDefault();

    // Validate ພື້ນຖານຝั่ง Frontend
    for (let i = 0; i < importItems.length; i++) {
      const item = importItems[i];
      if (!item.product_id) {
        toast.error(`ລາຍການທີ ${i + 1}: ກະລຸນາເລືອກສິນຄ້າ!`);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`ລາຍການທີ ${i + 1}: ຈຳນວນຕ້ອງมากกว่า 0!`);
      }

      const selectedProd = products.find(
        (p) => p.product_id.toString() === item.product_id.toString(),
      );
      if (selectedProd && Number(selectedProd.serial_number) === 1) {
        if (item.serial_number.some((sn) => !sn || !sn.trim())) {
          toast.error(
            `ລາຍການທີ ${i + 1}: ກະລຸນາປ້ອນ Serial Number ให้ครบທຸກໂຕ!`,
          );
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
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl font-lao",
      },
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    // ກະກຽມ Payload ຕາມທີ່ Controller ຕ້ອງການ (ສາມາດສົ່ງເປັນ Array ໄປໄດ້ເລີຍ)
    const payload = importItems.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      comment: item.comment.trim(),
      user_id: currentUserId,
      serial_number:
        item.serial_number.length > 0 ? item.serial_number : undefined,
    }));

    try {
      // ປ່ຽນຈາກ productApi.importProducts ມາເປັນ importApi.importProducts (ຕາມທີ່ແກ້ໃນ importApi.js)
      const res = await importApi.importProducts(payload);

      Swal.fire({
        title: "ນຳເຂົ້າສຳເລັດ!",
        text: res.data?.message || "ບັນທຶກການນຳເຂົ້າສິນຄ້າຮຽບຮ້ອຍແລ້ວ.",
        icon: "success",
        confirmButtonColor: "#f97316",
        customClass: {
          popup: "rounded-2xl font-lao",
        },
      });

      // Reset Form
      setImportItems([
        {
          product_id: "",
          quantity: 1,
          comment: "",
          serial_number: [],
        },
      ]);
      fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າສິນຄ້າ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 6. Render UI ---
  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            ນຳເຂົ້າສິນຄ້າເຂົ້າສະຕັອກ
          </h2>
          <p className="text-sm text-gray-500">
            ເພີ່ມຈຳນວນສິນຄ້າເຂົ້າສາງ, ບັນທຶກ Serial Number ແລະ ໝາຍເຫດການນຳເຂົ້າ
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2 font-medium"
        >
          <i className="fas fa-plus text-sm"></i>
          <span>ເພີ່ມລາຍການສິນຄ້າ</span>
        </button>
      </div>

      {/* Main Form Section */}
      <form onSubmit={handleSubmitImport} className="space-y-4">
        {importItems.map((item, index) => {
          const selectedProd = products.find(
            (p) => p.product_id.toString() === item.product_id.toString(),
          );
          const requiresSn =
            selectedProd && Number(selectedProd.serial_number) === 1;

          return (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative transition-all"
            >
              {/* លេខລຳດັບ */}
              <div className="md:col-span-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-sm shrink-0">
                  {index + 1}
                </span>
              </div>

              {/* ເລືອກສິນຄ້າ */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  ສິນຄ້າ <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    handleItemChange(index, "product_id", e.target.value)
                  }
                  required
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="">-- ເລືອກສິນຄ້າ --</option>
                  {products.map((prod) => (
                    <option key={prod.product_id} value={prod.product_id}>
                      {prod.product_name} ({prod.barcode}) - ຄົງเหลือ:{" "}
                      {prod.stock_qty}
                    </option>
                  ))}
                </select>
              </div>

              {/* ຈຳນວນ */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  ຈຳນວນ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  required
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              {/* ໝາຍເຫດ */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  ໝາຍເຫດ / ທີ່ມາ
                </label>
                <input
                  type="text"
                  value={item.comment}
                  onChange={(e) =>
                    handleItemChange(index, "comment", e.target.value)
                  }
                  placeholder="ເຊັ່ນ: ຮັບຈາກຜູ້ສະໜອງ A..."
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              {/* ປຸ່ມຈັດການແຖວ / Serial Number */}
              <div className="md:col-span-1 flex items-center justify-end gap-2 pt-6">
                {requiresSn && (
                  <button
                    type="button"
                    onClick={() => handleOpenSnModal(index)}
                    className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all relative"
                    title="ກໍານົດ Serial Number"
                  >
                    <i className="fas fa-barcode text-base"></i>
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.serial_number.filter(Boolean).length}/
                      {item.quantity}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="ລົບລາຍການນີ້"
                >
                  <i className="fas fa-trash-alt text-base"></i>
                </button>
              </div>
            </div>
          );
        })}

        {/* Submit Action Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            ລວມທັງໝົດ <b>{importItems.length}</b> ລາຍການນຳເຂົ້າ
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 font-bold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
            {isSubmitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການນຳເຂົ້າສິນຄ້າ"}
          </button>
        </div>
      </form>

      {/* Modal ປ້ອນ Serial Number */}
      {isSnModalOpen && activeSnIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseSnModal}
          />

          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                ກຳນົດ Serial Number (ລາຍການທີ {activeSnIndex + 1})
              </h3>
              <button
                type="button"
                onClick={handleCloseSnModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-gray-500">
                ກະລຸນາປ້ອນ Serial Number ໃຫ້ຄົບທັງໝົດ{" "}
                {importItems[activeSnIndex].quantity} ໂຕ:
              </p>
              {importItems[activeSnIndex].serial_number.map((sn, snIdx) => (
                <div key={snIdx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-6">
                    #{snIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={sn}
                    onChange={(e) => handleSnChange(snIdx, e.target.value)}
                    placeholder={`ປ້ອນ Serial No ໂຕທີ ${snIdx + 1}...`}
                    className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={handleCloseSnModal}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all text-sm"
              >
                ບັນທຶກ Serial ໄວ້ຊົ່ວຄາວ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
