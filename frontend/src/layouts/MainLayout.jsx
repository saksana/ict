import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      {/*min-w-0*/}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setIsOpen={setIsSidebarOpen} />

        <main className="overflow-y-auto">
          <div className="container mx-auto">
            <Outlet /> {/* ເນື້ອຫາຂອງແຕ່ລະໜ້າຈະມາສະແດງບ່ອນນີ້ */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
