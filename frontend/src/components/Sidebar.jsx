import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [isResize, setIsResize] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userRole = user.role;

  const menuItems = [
    { title: "Dashboard", icon: "fas fa-chart-line", path: "/dashboard", roles: ["Admin"] },
    { title: "ຂາຍສິນຄ້າ (POS)", icon: "fas fa-shopping-cart", path: "/pos", roles: ["Admin", "Sale"] },
    { title: "ຈັດການສິນຄ້າ", icon: "fas fa-box", path: "/products", roles: ["Admin"] },
    { title: "ສະຕັອກສິນຄ້າ", icon: "fas fa-warehouse", path: "/stock", roles: ["Admin"] },
    { title: "ລາຍງານ", icon: "fas fa-file-invoice-dollar", path: "/reports", roles: ["Admin"] },
    { title: "ຕັ້ງຄ່າ", icon: "fas fa-cog", path: "/settings", roles: ["Admin"] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const resize = () => {
    setIsResize(!isResize);
  };
  return (
    <>
      {/* Overlay ສໍາລັບມືຖື: ຄລິກບ່ອນຫວ່າງແລ້ວປິດ Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
    pt-16 fixed inset-y-0 left-0 z-30 bg-slate-900 text-white 
    transition-all duration-500 ease-in-out transform 
    ${isResize ? "w-20" : "w-64"} 
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:static md:inset-0
  `}
      >
        <div className="p-2 px-6 flex items-center justify-between border-b border-slate-700 h-16">
          {/* ຊ່ອນຄຳວ່າ MENU ເວລາຫຍໍ້ sidebar */}
          <div
            className={`font-bold transition-opacity duration-300 ${isResize ? "opacity-0 w-0" : "opacity-100"}`}
          >
            {!isResize && "MENU"}
          </div>

          <button
            onClick={resize}
            className="cursor-pointer p-3 hidden md:block hover:bg-slate-800 rounded-full transition-colors"
          >
            <i
              className={`fa fa-chevron-left transition-transform duration-500 ${isResize ? "rotate-180" : "rotate-0"}`}
              aria-hidden="true"
            ></i>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 hover:bg-slate-800 rounded-lg md:hidden ${isOpen ? "block" : "hidden"}`}
          >
            <i className={`fas fa-times`}></i>
          </button>
        </div>

        <nav className="mt-6 px-3">
          {filteredMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center p-3 mb-2 rounded-md transition-all duration-300 ${
                location.pathname === item.path
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <i
                className={`${item.icon} text-lg min-w-8 text-center`}
              ></i>
              <span
                className={`ml-4 text-sm whitespace-nowrap transition-all duration-500 ease-in-out overflow-hidden ${
                  isResize ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
                }`}
              >
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
