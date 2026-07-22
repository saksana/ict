import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../assets/logo_ict.png";
export default function Navbar({ setIsOpen }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // ສ້າງບ່ອນອ້າງອີງ
  //   // ເພີ່ມ Event Listener ເພື່ອກວດຈັບການຄລິກທົ່ວໜ້າຈໍ
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ຖ້າ menu ເປີດຢູ່ ແລະ ຈຸດທີ່ຄລິກບໍ່ໄດ້ຢູ່ໃນ menuRef (ບ່ອນອື່ນ)
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // ລົງທະບຽນ event
    document.addEventListener("mousedown", handleClickOutside);

    // ລຶບ event ເມື່ອ Component ຖືກທຳລາຍ (Cleanup)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {
    fullname: "No user",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    // <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 transition-all">
    // ໂຄ້ດໃໝ່ທີ່ປ່ຽນເປັນ fixed w-full:
    <header className="bg-white backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 transition-all">
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 mr-4 text-gray-600 md:hidden hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={icon}
              alt="Logo"
              className="size-11 object-contain transform group-hover:scale-102 transition-transform duration-300"
            />
          </div>
          <span className="text-gray-800 text-md tracking-tight hidden sm:block">
            ຮ້ານ ICT Shop
          </span>
        </div>
      </div>

      {/* User Menu Area */}
      <div className="relative ml-3 w-15" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className={`group relative flex items-center p-1 rounded-full transition-all duration-300 hover:bg-blue-50`}
        >
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className={`size-9 rounded-full object-cover shadow-sm border border-gray-200 ${isMenuOpen ? "ring-2 ring-indigo-500 bg-blue-50" : "hover:bg-gray-100"}`}
          />
          <svg
            className={`w-12 h-12 ml-1 mr-1 text-gray-500 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Menu ທີ່ຈະສະແດງ/ເຊື່ອງ */}
        <div
          className={`absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out ${
            isMenuOpen
              ? "opacity-100 translate-y-0 scale-100 visible"
              : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
          }`}
        >
          {/* --- 1. ລູກສອນຊີ້ຂຶ້ນ (Arrow) --- */}
          {/* ເຮົາໃຊ້ CSS Pseudo-element ຫຼື Div ມາເຮັດເປັນສາມຫຼ່ຽມ */}
          <div className="absolute -top-1 right-5 h-3 w-3 rotate-45 bg-white border-l border-t border-gray-100"></div>

          {/* ສ່ວນຫົວ (Optional: ເພີ່ມເພື່ອໃຫ້ເບິ່ງດີຂຶ້ນ) */}
          <div className="px-4 py-3 border-b border-gray-50 mb-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.fullname}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>

          <nav className="space-y-0.5">
            <MenuLink icon={<UserIcon />} label="ຂໍ້ມູນຜູ້ໃຊ້ລະບົບ" />
            <MenuLink icon={<SettingIcon />} label="ຕັ້ງຄ່າລະບົບ" />

            <div className="my-2 border-t border-gray-50"></div>

            <button
              onClick={handleLogout}
              className="w-full group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-600 hover:bg-red-100 transition-all duration-200 font-semibold"
            >
              <LogoutIcon />
              <span>ອອກຈາກລະບົບ</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

// ສ້າງ Component ຍ່ອຍເພື່ອໃຫ້ Code ສະອາດຂຶ້ນ
function MenuLink({ icon, label }) {
  return (
    <a
      href="#"
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
    >
      <span className="text-gray-400 group-hover:text-blue-500 transition-transform group-hover:scale-110">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </a>
  );
}

// Icons (SVG ເປັນ Component ເພື່ອຄວາມເປັນລະບຽບ)
const UserIcon = () => (
  <svg
    className="size-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const SettingIcon = () => (
  <svg
    className="size-5 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="size-5 text-red-500 transition-transform group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
    />
  </svg>
);
