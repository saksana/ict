import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../assets/logo.png";
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
    fullname: "Guest",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="text-gray-700 text-sm flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 mr-4 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg"
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
        <button className="cursor-pointer relative flex">
          <span className="sr-only">logo</span>
          <img
            src={icon}
            alt="User Profile"
            className="size-10 outline outline-white/10"
          />
        </button>
        <label className="ml-2">ລະບົບຈັດການຮ້ານ ict shop</label>
      </div>

      <div className="relative ml-3 w-15" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="cursor-pointer relative flex rounded-full focus:outline-none hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Open user menu</span>
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User Profile"
            className="size-10 rounded-full bg-gray-800 outline outline-white/10"
          />
        </button>

        {/* Menu ທີ່ຈະສະແດງ/ເຊື່ອງ */}
        {isMenuOpen && (
          <div className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 ring-opacity-5 focus:outline-none">
            {/* --- 1. ລູກສອນຊີ້ຂຶ້ນ (Arrow) --- */}
            {/* ເຮົາໃຊ້ CSS Pseudo-element ຫຼື Div ມາເຮັດເປັນສາມຫຼ່ຽມ */}
            <div className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-black/5 bg-white z-[-1]"></div>

            {/* ສ່ວນຫົວ (Optional: ເພີ່ມເພື່ອໃຫ້ເບິ່ງດີຂຶ້ນ) */}
            <div className="px-4 py-3 border-b border-gray-100 mb-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.fullname}
              </p>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>

            {/* --- 3. ໄອຄອນປະກອບໃນແຕ່ລະເມນູ --- */}

            {/* Profile Link */}
            <a
              href="#"
              className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {/* User Icon */}
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
              <span className="font-medium">Your profile</span>
            </a>

            {/* Settings Link */}
            <a
              href="#"
              className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {/* Settings Icon */}
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
              <span className="font-medium">Settings</span>
            </a>

            {/* Line break */}
            <div className="my-2 border-t border-gray-100"></div>

            {/* --- 2. ປຸ່ມ Sign out ສີແດງ --- */}
            <a
              onClick={handleLogout}
              className="cursor-pointer group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              {/* Logout Icon */}
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
              <span>Sign out</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}











// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import icon from "../assets/logo.png";

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const menuRef = useRef(null); // ສ້າງບ່ອນອ້າງອີງ

//   // ເພີ່ມ Event Listener ເພື່ອກວດຈັບການຄລິກທົ່ວໜ້າຈໍ
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // ຖ້າ menu ເປີດຢູ່ ແລະ ຈຸດທີ່ຄລິກບໍ່ໄດ້ຢູ່ໃນ menuRef (ບ່ອນອື່ນ)
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     // ລົງທະບຽນ event
//     document.addEventListener("mousedown", handleClickOutside);

//     // ລຶບ event ເມື່ອ Component ຖືກທຳລາຍ (Cleanup)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user")) || {
//     fullname: "Guest",
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   return (
//     <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
//       <div className="text-gray-700 text-sm flex items-center">
//         <button
//           //onClick={toggleSidebar}
//           className="md:hidden p-2 mr-3 text-gray-600 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100"
//         >
//           <i className="fas fa-bars text-xl"></i>
//         </button>
//         <button className="cursor-pointer relative flex">
//           <span className="sr-only">logo</span>
//           <img
//             src={icon}
//             alt="User Profile"
//             className="size-10 outline outline-white/10"
//           />
//         </button>
//         <label className="ml-2">ລະບົບຈັດການຮ້ານ ict shop</label>
//       </div>

//       <div className="relative ml-3 w-15" ref={menuRef}>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="cursor-pointer relative flex rounded-full focus:outline-none hover:ring-2 hover:ring-blue-500 focus:ring-2 focus:ring-indigo-500"
//         >
//           <span className="sr-only">Open user menu</span>
//           <img
//             src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//             alt="User Profile"
//             className="size-10 rounded-full bg-gray-800 outline outline-white/10"
//           />
//         </button>

//         {/* Menu ທີ່ຈະສະແດງ/ເຊື່ອງ */}
//         {isOpen && (
//           <div className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 ring-opacity-5 focus:outline-none">
//             {/* --- 1. ລູກສອນຊີ້ຂຶ້ນ (Arrow) --- */}
//             {/* ເຮົາໃຊ້ CSS Pseudo-element ຫຼື Div ມາເຮັດເປັນສາມຫຼ່ຽມ */}
//             <div className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-black/5 bg-white z-[-1]"></div>

//             {/* ສ່ວນຫົວ (Optional: ເພີ່ມເພື່ອໃຫ້ເບິ່ງດີຂຶ້ນ) */}
//             <div className="px-4 py-3 border-b border-gray-100 mb-1">
//               <p className="text-sm font-semibold text-gray-900 truncate">
//                 {user.fullname}
//               </p>
//               <p className="text-xs text-green-500 font-medium">Online</p>
//             </div>

//             {/* --- 3. ໄອຄອນປະກອບໃນແຕ່ລະເມນູ --- */}

//             {/* Profile Link */}
//             <a
//               href="#"
//               className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               {/* User Icon */}
//               <svg
//                 className="size-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//                 />
//               </svg>
//               <span className="font-medium">Your profile</span>
//             </a>

//             {/* Settings Link */}
//             <a
//               href="#"
//               className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               {/* Settings Icon */}
//               <svg
//                 className="size-5 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//                 />
//               </svg>
//               <span className="font-medium">Settings</span>
//             </a>

//             {/* Line break */}
//             <div className="my-2 border-t border-gray-100"></div>

//             {/* --- 2. ປຸ່ມ Sign out ສີແດງ --- */}
//             <a
//               onClick={handleLogout}
//               className="cursor-pointer group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
//             >
//               {/* Logout Icon */}
//               <svg
//                 className="size-5 text-red-500 transition-transform group-hover:translate-x-1"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
//                 />
//               </svg>
//               <span>Sign out</span>
//             </a>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;
