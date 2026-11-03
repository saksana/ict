import React from "react";
import { Link } from "react-router-dom";

export default function ManagePage() {
  // ລາຍການເມນູຂໍ້ມູນຫຼັກ
  const menuList = [
    {
      id: 1,
      title: "ຈັດການປະເພດສິນຄ້າ",
      description: "ຈັດໝວດໝູ່ສິນຄ້າ, ໝວດໝູ່ຍ່ອຍ ເພື່ອຄວາມເປັນລະບຽບ",
      path: "/categories",
      icon: "fas fa-layer-group",
      badge: "ປະເພດສິນຄ້າ",
      color: "emerald",
      bgIcon:
        "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
      borderHover: "hover:border-amber-500/50",
      textAccent: "text-amber-600 group-hover:text-amber-700",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      id: 2,
      title: "ຈັດການຂໍ້ມູນລູກຄ້າ",
      description: "ເພີ່ມ, ແກ້ໄຂ, ລົບ ແລະ ເບິ່ງປະວັດ/ຂໍ້ມູນການຕິດຕໍ່ຂອງລູກຄ້າ",
      path: "/customers",
      icon: "fas fa-users",
      badge: "ລູກຄ້າ",
      color: "indigo",
      // Tailwind classes ສຳລັບການເຮັດ Theme ແຍກແຕ່ລະ Card
      bgIcon:
        "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      borderHover: "hover:border-blue-500/50",
      textAccent: "text-amber-600 group-hover:text-amber-700",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    },

    {
      id: 3,
      title: "ຜູ້ສະໜອງສິນຄ້າ",
      description: "ບັນທຶກຂໍ້ມູນ Supplier, ບໍລິສັດຄູ່ຄ້າ ແລະ ຊ່ອງທາງຕິດຕໍ່",
      path: "/suppliers",
      icon: "fas fa-truck-field",
      badge: "Suppliers",
      color: "amber",
      bgIcon:
        "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
      borderHover: "hover:border-purple-500/50",
      textAccent: "text-amber-600 group-hover:text-amber-700",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
    }
  ];

  return (
    <div className="pt-20 p-6 space-y-6 font-lao bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header ຫົວຂໍ້ */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl shadow-inner">
            <i className="fas fa-th-large"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              ຈັດການຂໍ້ມູນ
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ເລືອກເມນູທີ່ຕ້ອງການຈັດການຂໍ້ມູນໃນລະບົບ
            </p>
          </div>
        </div>

   
      </div>

        {/* Cards Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuList.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover: ${item.borderHover} transition-all duration-300 ease-in-out flex flex-col justify-between hover:-translate-y-1`}
            >
              <div>
                {/* Header inside Card: Icon & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${item.bgIcon}`}
                  >
                    <i className={item.icon}></i>
                  </div>
                  
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${item.textAccent} transition-colors`}
                >
                  ຈັດການຂໍ້ມູນ
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 ${item.textAccent} transition-all duration-200`}
                >
                  <i className="fas fa-arrow-right text-xs transform group-hover:translate-x-0.5 transition-transform"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
