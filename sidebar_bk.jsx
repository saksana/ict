import { Link, useLocation } from "react-router-dom";
export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: "fas fa-chart-line", path: "/dashboard" },
    { title: "ຂາຍສິນຄ້າ (POS)", icon: "fas fa-shopping-cart", path: "/pos" },
    { title: "ຈັດການສິນຄ້າ", icon: "fas fa-box", path: "/products" },
    { title: "ສະຕັອກສິນຄ້າ", icon: "fas fa-warehouse", path: "/stock" },
    { title: "ລາຍງານ", icon: "fas fa-file-invoice-dollar", path: "/reports" },
    { title: "ຕັ້ງຄ່າ", icon: "fas fa-cog", path: "/settings" },
  ];

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
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
      `}
      >
        <div className="p-3 px-6 flex items-center justify-between border-b border-slate-700">
          {/* <div className='flex items-center'><img src={icon} width={40}/>MENU</div> */}
          <div className="">MENU</div>
          <button
            //onClick={toggleSidebar}
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <i className={`fas fa-times`}></i>
          </button>
        </div>
        <nav className="mt-6 px-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center p-3 mb-2 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <i className={`${item.icon} text-lg w-8 text-center`}></i>
              <span
                className={`ml-2 whitespace-nowrap overflow-hidden transition-all`}
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

// import { Link, useLocation } from 'react-router-dom';
// import icon from '../assets/logo.png';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//     const location = useLocation();

//     const menuItems = [
//         { title: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
//         { title: 'ຂາຍສິນຄ້າ (POS)', icon: 'fas fa-shopping-cart', path: '/pos' },
//         { title: 'ຈັດການສິນຄ້າ', icon: 'fas fa-box', path: '/products' },
//         { title: 'ສະຕັອກສິນຄ້າ', icon: 'fas fa-warehouse', path: '/stock' },
//         { title: 'ລາຍງານ', icon: 'fas fa-file-invoice-dollar', path: '/reports' },
//         { title: 'ຕັ້ງຄ່າ', icon: 'fas fa-cog', path: '/settings' },
//     ];

//     return (
//         <div className={`hidden md:inline bg-slate-900 text-white min-h-screen transition-all duration-300 shadow-xl ${isOpen ? 'w-64' : 'w-18'}`}>
//             <div className="p-3 px-6 flex items-center justify-between border-b border-slate-700">
//                 {/* <div className='flex items-center'><img src={icon} width={40}/>MENU</div> */}
//                 <div className={`${isOpen ? 'block' : 'hidden'}`}>MENU</div>
//                 <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-lg">
//                     <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
//                 </button>
//             </div>

//             <nav className="mt-6 px-3">
//                 {menuItems.map((item, index) => (
//                     <Link
//                         key={index}
//                         to={item.path}
//                         className={`flex items-center p-3 mb-2 rounded-xl transition-all ${
//                             location.pathname === item.path
//                             ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//                             : 'hover:bg-slate-800 text-slate-400'
//                         }`}
//                     >
//                         <i className={`${item.icon} text-lg w-8 text-center`}></i>
//                         <span className={`ml-2 whitespace-nowrap overflow-hidden transition-all ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
//                             {item.title}
//                         </span>
//                     </Link>
//                 ))}
//             </nav>
//         </div>
//     );
// };

// export default Sidebar;
