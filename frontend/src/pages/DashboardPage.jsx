import React, { useState, useEffect } from "react";
import * as dashboardApi from "../api/dashboardApi";
import { toast } from "react-toastify";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    low_stock_count: 0,
    recent_sales: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.getDashboardStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນສະຖິຕິໄດ້");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 p-6 flex items-center justify-center min-h-screen bg-gray-50 font-lao">
        <div className="text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-2xl text-orange-500 mb-2"></i>
          <p className="text-sm">ກຳລັງໂຫລດຂໍ້ມູນສະຖິຕິ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      {/* Header ຫົວຂໍ້ */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ພາບລວມລະບົບ (Dashboard)
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ສະຖິຕິການຂາຍ ແລະ ຂໍ້ມູນສຳຄັນພາຍໃນຮ້ານຄ້າ
            </p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
        >
          <i className="fas fa-sync-alt text-xs"></i>
          <span>ຣີເຟຣດ</span>
        </button>
      </div>

      {/* Cards Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ຍອດຂາຍລວມ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ຍອດຂາຍລວມທັງໝົດ</p>
            <h3 className="text-xl font-black text-gray-800 mt-0.5 font-mono">
              {Number(stats.total_sales || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">₭</span>
            </h3>
          </div>
        </div>

        {/* ຈຳນວນອໍເດີ້ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ຈຳນວນອໍເດີ້ຂາຍ</p>
            <h3 className="text-xl font-black text-gray-800 mt-0.5 font-mono">
              {Number(stats.total_orders || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">ບິນ</span>
            </h3>
          </div>
        </div>

        {/* ສິນຄ້າທັງໝົດ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-box-open"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ສິນຄ້າໃນລະບົບ</p>
            <h3 className="text-xl font-black text-gray-800 mt-0.5 font-mono">
              {Number(stats.total_products || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">ລາຍການ</span>
            </h3>
          </div>
        </div>

        {/* ລູກຄ້າ */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">ລູກຄ້າທັງໝົດ</p>
            <h3 className="text-xl font-black text-gray-800 mt-0.5 font-mono">
              {Number(stats.total_customers || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">ຄົນ</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Sales Table Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-chart-line text-orange-500"></i>
          <span>ຍອດຂາຍປະຈຳວັນ (7 ວັນຫຼ້າສຸດ)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase">ວັນທີ</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center">ຈຳນວນບິນຂາຍ</th>
                <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">ຍອດຂາຍລວມ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {stats.recent_sales && stats.recent_sales.length > 0 ? (
                stats.recent_sales.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-medium text-gray-800">{item.sale_date}</td>
                    <td className="p-3 text-center text-gray-600 font-mono font-bold">{item.daily_orders} ບິນ</td>
                    <td className="p-3 text-right font-mono font-black text-orange-600">
                      {Number(item.daily_sales).toLocaleString()} ₭
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-gray-400">
                    ບໍ່ມີຂໍ້ມູນຍອດຂາຍ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;