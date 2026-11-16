import React, { useState, useEffect, useCallback, useRef } from "react";
import * as reportApi from "../api/reportApi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("sales"); // sales, top_products, low_stock, stock_in, customers
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter ວັນທີສຳລັບຍອດຂາຍ
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const printComponentRef = useRef();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "sales") {
        res = await reportApi.getSalesReport({
          start_date: startDate,
          end_date: endDate,
        });
      } else if (activeTab === "top_products") {
        res = await reportApi.getTopProductsReport();
      } else if (activeTab === "low_stock") {
        res = await reportApi.getLowStockReport();
      } else if (activeTab === "stock_in") {
        res = await reportApi.getStockInReport();
      } else if (activeTab === "customers") {
        res = await reportApi.getCustomerReport();
      }

      if (res?.success) {
        setReportData(res.data || []);
      }
    } catch (err) {
      console.error("Fetch report error:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລາຍງານໄດ້");
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ຟັງຊັນ Export ເປັນ Excel (.xlsx)
  const exportToExcel = () => {
    if (reportData.length === 0) {
      return toast.warning("ບໍ່ມີຂໍ້ມູນສຳລັບ Export!");
    }
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Report_${activeTab}_${Date.now()}.xlsx`);
    toast.success("ດາວໂຫຼດ Excel ສຳເລັດ!");
  };

  // ຟັງຊັນ Print ຜ່ານ react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Report_${activeTab}_${Date.now()}`,
    onAfterPrint: () => toast.success("ພິມລາຍງານສຳເລັດ!"),
  });

  const tabs = [
    { id: "sales", label: "ຍອດຂາຍປະຈຳວັນ/ເດືອນ", icon: "fa-chart-line" },
    { id: "top_products", label: "ສິນຄ້າຂາຍດີ", icon: "fa-fire" },
    {
      id: "low_stock",
      label: "ສິນຄ້າໃກ້ໝົດສະຕັອກ",
      icon: "fa-exclamation-triangle",
    },
    { id: "stock_in", label: "ການນຳເຂົ້າສິນຄ້າ", icon: "fa-truck-loading" },
    { id: "customers", label: "ລາຍງານລູກຄ້າ", icon: "fa-users" },
  ];

  // 🟢 ຟັງຊັນ Format ວັນທີ ແລະ ເວລາແບບ 24 ຊົ່ວໂມງ
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
      hour12: false, // บັງຄັບໃຊ້ລະບົບ 24 ຊົ່ວໂມງ
    });
  };

  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header ຫົວຂໍ້ (Theme ດຽວກັນ) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ລາຍງານ ແລະ ສະຖິຕິ (Reports)
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ກວດສອບ ແລະ ດຶງຂໍ້ມູນລາຍງານຕ່າງໆພ້ອມສົ່ງອອກເປັນ Excel ແລະ ພິມ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🟢 ປຸ່ມພິມລາຍງານ */}
          <button
            onClick={() => handlePrint()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
          >
            <i className="fas fa-print"></i>
            <span>ພິມລາຍງານ</span>
          </button>

          {/* ປຸ່ມ Export Excel */}
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
          >
            <i className="fas fa-file-excel"></i>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Cards Menu Grid (5 ບັດລາຍງານ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              activeTab === tab.id
                ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                : "bg-white border-gray-100 hover:border-orange-200 text-slate-700 shadow-sm"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
            </div>
            <div>
              <h3 className="font-bold text-sm line-clamp-1">{tab.label}</h3>
              <p
                className={`text-[10px] mt-0.5 ${activeTab === tab.id ? "text-orange-100" : "text-gray-400"}`}
              >
                ກົດເພື່ອເບິ່ງລາຍລະອຽດ
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter Bar (ສະເພາະໜ້າ Sales) */}
      {activeTab === "sales" && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">ຈາກວັນທີ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">ເຖິງວັນທີ:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            ຄົ້ນຫາ
          </button>
        </div>
      )}

      {/* Report Data Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">
            ລາຍລະອຽດລາຍງານ:{" "}
            <span className="text-orange-600">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </h3>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            ທັງໝົດ {reportData.length} ລາຍການ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4">ລຳດັບ</th>
                {activeTab === "sales" && (
                  <>
                    <th className="p-4">ເລກທີບິນ</th>
                    <th className="p-4">ລູກຄ້າ</th>
                    <th className="p-4 text-right">ຍອດລວມ</th>
                    <th className="p-4 text-right">ສ່ວນຫຼຸດ</th>
                    <th className="p-4 text-right">ຍອດສຸດທິ</th>
                    <th className="p-4">ວັນທີຂາຍ</th>
                  </>
                )}
                {activeTab === "top_products" && (
                  <>
                    <th className="p-4">Barcode</th>
                    <th className="p-4">ຊື່ສິນຄ້າ</th>
                    <th className="p-4 text-center">ຈຳນວນທີ່ຂາຍໄດ້</th>
                    <th className="p-4 text-right">ລາຍໄດ້ລວມ</th>
                  </>
                )}
                {activeTab === "low_stock" && (
                  <>
                    <th className="p-4">Barcode</th>
                    <th className="p-4">ຊື່ສິນຄ້າ</th>
                    <th className="p-4">ໝວດໝູ່</th>
                    <th className="p-4 text-center">ຄົງเหลือ (Stock)</th>
                    <th className="p-4 text-right">ລາຄາຂາຍ</th>
                  </>
                )}
                {activeTab === "stock_in" && (
                  <>
                    <th className="p-4">ວັນທີນຳເຂົ້າ</th>
                    <th className="p-4">Barcode</th>
                    <th className="p-4">ຊື່ສິນຄ້າ</th>
                    <th className="p-4 text-center">ຈຳນວນນຳເຂົ້າ</th>
                    <th className="p-4">ຜູ້ບັນທຶກ</th>
                    <th className="p-4">ໝາຍເຫດ</th>
                  </>
                )}
                {activeTab === "customers" && (
                  <>
                    <th className="p-4">ຊື່ລູກຄ້າ</th>
                    <th className="p-4">ເບີໂທ</th>
                    <th className="p-4">ທີ່ຢູ່</th>
                    <th className="p-4 text-center">ຄະແນນສະສົມ</th>
                    <th className="p-4 text-center">ຈຳນວນບິນທີ່ຊື້</th>
                    <th className="p-4 text-right">ຍອດຊື້ລວມ</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2 text-orange-500"></i>{" "}
                    ກຳລັງໂຫຼດຂໍ້ມູນ...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400">
                    ບໍ່ມີຂໍ້ມູນລາຍງານໃນສ່ວນນີ້
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-gray-500">{idx + 1}</td>
                    {activeTab === "sales" && (
                      <>
                        <td className="p-4 font-bold text-orange-600">
                          {row.order_no}
                        </td>
                        <td className="p-4 font-medium text-slate-800">
                          {row.customer_name || "ລູກຄ້າທົ່ວໄປ"}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {Number(row.total_amount).toLocaleString()} ₭
                        </td>
                        <td className="p-4 text-right font-mono text-red-500">
                          -{Number(row.discount).toLocaleString()} ₭
                        </td>
                        <td className="p-4 text-right font-mono font-black text-slate-800">
                          {Number(row.net_amount).toLocaleString()} ₭
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-mono">
                          {formatDateTime(row.created_at)}
                        </td>
                      </>
                    )}
                    {activeTab === "top_products" && (
                      <>
                        <td className="p-4 font-mono text-xs text-gray-500">
                          {row.barcode}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {row.product_name}
                        </td>
                        <td className="p-4 text-center font-bold text-orange-600">
                          {row.total_qty_sold}
                        </td>
                        <td className="p-4 text-right font-mono font-black">
                          {Number(row.total_revenue).toLocaleString()} ₭
                        </td>
                      </>
                    )}
                    {activeTab === "low_stock" && (
                      <>
                        <td className="p-4 font-mono text-xs text-gray-500">
                          {row.barcode}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {row.product_name}
                        </td>
                        <td className="p-4">
                          <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-xs">
                            {row.category_name}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-red-500 bg-red-50/50">
                          {row.stock_qty}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {Number(row.sale_price).toLocaleString()} ₭
                        </td>
                      </>
                    )}
                    {activeTab === "stock_in" && (
                      <>
                        <td className="p-4 text-xs text-gray-500 font-mono">
                          {formatDateTime(row.created_at)}
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-500">
                          {row.barcode}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {row.product_name}
                        </td>
                        <td className="p-4 text-center font-bold text-emerald-600">
                          +{row.quantity}
                        </td>
                        <td className="p-4 text-gray-600">
                          {row.staff_name || "-"}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {row.comment || "-"}
                        </td>
                      </>
                    )}
                    {activeTab === "customers" && (
                      <>
                        <td className="p-4 font-bold text-slate-800">
                          {row.customer_name}
                        </td>
                        <td className="p-4 text-gray-600 font-mono">
                          {row.phone || "-"}
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {row.address || "-"}
                        </td>
                        <td className="p-4 text-center font-bold text-purple-600">
                          {row.points} Pts
                        </td>
                        <td className="p-4 text-center font-bold">
                          {row.total_orders} ບິນ
                        </td>
                        <td className="p-4 text-right font-mono font-black text-orange-600">
                          {Number(row.total_spent).toLocaleString()} ₭
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Printable Component ສຳລັບການພິມ */}
      <div className="hidden">
        <PrintableReport
          ref={printComponentRef}
          title={tabs.find((t) => t.id === activeTab)?.label}
          data={reportData}
          activeTab={activeTab}
          formatDateTime={formatDateTime}
        />
      </div>
    </div>
  );
}

// 📄 Component ສຳລັບຈັດ Layout ເວລາ Print (ອອກແບບໃໝ່ໃຫ້ສວຍງາມເປັນທາງການ)
const PrintableReport = React.forwardRef(({ title, data, activeTab, formatDateTime }, ref) => {
  const currentDate = new Date().toLocaleString("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      ref={ref}
      className="p-10 bg-white text-slate-800 font-lao max-w-[210mm] mx-auto text-sm"
    >
      {/* ຫົວບິນບໍລິສັດ */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black text-orange-600 uppercase tracking-wide">
            ICT SOLUTION
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ຖະໜົນດົງຈອງ, ບ້ານ ແສງສະຫວ່າງ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ
          </p>
          <p className="text-xs text-slate-500">
            ໂທ: 020 55502190 | Email: info@mvpshop.com
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            ບົດລາຍງານ (REPORT)
          </h2>
          <p className="text-xs font-bold text-orange-600 mt-1">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ວັນທີພິມ: {currentDate}
          </p>
        </div>
      </div>

      {/* ຕາຕະລາງສະແດງຂໍ້ມູນ */}
      <table className="w-full text-left border-collapse text-xs mb-10">
        <thead>
          <tr className="bg-slate-800 text-white font-bold uppercase">
            <th className="p-3 text-center rounded-l-xl w-12 border-0">
              ລຳດັບ
            </th>
            {activeTab === "sales" && (
              <>
                <th className="p-3 border-0">ເລກທີບິນ</th>
                <th className="p-3 border-0">ລູກຄ້າ</th>
                <th className="p-3 border-0 text-right">ຍອດລວມ</th>
                <th className="p-3 border-0 text-right">ສ່ວນຫຼຸດ</th>
                <th className="p-3 border-0 text-right">ຍອດສຸດທິ</th>
                <th className="p-3 border-0 rounded-r-xl">ວັນທີຂາຍ</th>
              </>
            )}
            {activeTab === "top_products" && (
              <>
                <th className="p-3 border-0">Barcode</th>
                <th className="p-3 border-0">ຊື່ສິນຄ້າ</th>
                <th className="p-3 border-0 text-center">ຈຳນວນຂາຍ</th>
                <th className="p-3 border-0 text-right rounded-r-xl">
                  ລາຍໄດ້ລວມ
                </th>
              </>
            )}
            {activeTab === "low_stock" && (
              <>
                <th className="p-3 border-0">Barcode</th>
                <th className="p-3 border-0">ຊື່ສິນຄ້າ</th>
                <th className="p-3 border-0">ໝວດໝູ່</th>
                <th className="p-3 border-0 text-center">ຄົງເຫຼືອ</th>
                <th className="p-3 border-0 text-right rounded-r-xl">
                  ລາຄາຂາຍ
                </th>
              </>
            )}
            {activeTab === "stock_in" && (
              <>
                <th className="p-3 border-0">ວັນທີ</th>
                <th className="p-3 border-0">Barcode</th>
                <th className="p-3 border-0">ຊື່ສິນຄ້າ</th>
                <th className="p-3 border-0 text-center">ຈຳນວນ</th>
                <th className="p-3 border-0 rounded-r-xl">ຜູ້ບັນທຶກ</th>
              </>
            )}
            {activeTab === "customers" && (
              <>
                <th className="p-3 border-0">ຊື່ລູກຄ້າ</th>
                <th className="p-3 border-0">ເບີໂທ</th>
                <th className="p-3 border-0 text-center">ຄະແນນ</th>
                <th className="p-3 border-0 text-center">ຈຳນວນບິນ</th>
                <th className="p-3 border-0 text-right rounded-r-xl">
                  ຍອດຊື້ລວມ
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" className="p-6 text-center text-slate-400">
                ບໍ່ມີຂໍ້ມູນລາຍງານ
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-center text-slate-400 font-mono">
                  {idx + 1}
                </td>
                {activeTab === "sales" && (
                  <>
                    <td className="p-3 font-bold text-orange-600 font-mono">
                      #{row.order_id}
                    </td>
                    <td className="p-3 font-medium">
                      {row.customer_name || "ລູກຄ້າທົ່ວໄປ"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {Number(row.total_amount).toLocaleString()} ₭
                    </td>
                    <td className="p-3 text-right font-mono text-red-500">
                      -{Number(row.discount).toLocaleString()} ₭
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {Number(row.net_amount).toLocaleString()} ₭
                    </td>
                    <td className="p-3 text-xs text-slate-500 font-mono">
                      {formatDateTime(row.created_at)}
                    </td>
                  </>
                )}
                {activeTab === "top_products" && (
                  <>
                    <td className="p-3 font-mono text-xs text-slate-500">
                      {row.barcode}
                    </td>
                    <td className="p-3 font-bold">{row.product_name}</td>
                    <td className="p-3 text-center font-bold text-orange-600">
                      {row.total_qty_sold}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {Number(row.total_revenue).toLocaleString()} ₭
                    </td>
                  </>
                )}
                {activeTab === "low_stock" && (
                  <>
                    <td className="p-3 font-mono text-xs text-slate-500">
                      {row.barcode}
                    </td>
                    <td className="p-3 font-bold">{row.product_name}</td>
                    <td className="p-3">{row.category_name}</td>
                    <td className="p-3 text-center font-bold text-red-600 bg-red-50">
                      {row.stock_qty}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {Number(row.sale_price).toLocaleString()} ₭
                    </td>
                  </>
                )}
                {activeTab === "stock_in" && (
                  <>
                    <td className="p-3 text-xs text-slate-500 font-mono">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500">
                      {row.barcode}
                    </td>
                    <td className="p-3 font-bold">{row.product_name}</td>
                    <td className="p-3 text-center font-bold text-emerald-600">
                      +{row.quantity}
                    </td>
                    <td className="p-3">{row.staff_name || "-"}</td>
                  </>
                )}
                {activeTab === "customers" && (
                  <>
                    <td className="p-3 font-bold">{row.customer_name}</td>
                    <td className="p-3 text-slate-500 font-mono">
                      {row.phone || "-"}
                    </td>
                    <td className="p-3 text-center font-bold text-purple-600">
                      {row.points} Pts
                    </td>
                    <td className="p-3 text-center font-bold">
                      {row.total_orders} ບິນ
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-orange-600">
                      {Number(row.total_spent).toLocaleString()} ₭
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ສ່ວນລົງລາຍເຊັນ */}
      <div className="grid grid-cols-2 gap-10 mt-16 text-center text-xs text-slate-600 page-break-inside-avoid">
        <div className="space-y-16">
          <p className="font-bold">ຜູ້ຈັດທຳລາຍງານ (Prepared By)</p>
          <div className="w-56 border-b border-slate-300 mx-auto"></div>
          <p className="text-[11px] text-slate-400">
            ວັນທີ: .......................................
          </p>
        </div>
        <div className="space-y-16">
          <p className="font-bold">ຜູ້ອະນຸມັດ (Approved By)</p>
          <div className="w-56 border-b border-slate-300 mx-auto"></div>
          <p className="text-[11px] text-slate-400">
            ວັນທີ: .......................................
          </p>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = "PrintableReport";