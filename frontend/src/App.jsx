import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Import Pages & Layouts
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import NotfoundPage from './pages/NotfoundPage';
import SalePage from './pages/SalePage';
import SaleHistoryPage from "./pages/SaleHistoryPage";

// ສ້າງ Component ໜ້າອື່ນໆແບບຊົ່ວຄາວ (Placeholder) ເພື່ອໃຫ້ທົດສອບ Link ໄດ້
const Dashboard = () => <div className="text-2xl font-bold pt-20">ໜ້າ Dashboard (ກຳລັງພັດທະນາ)</div>;
const POSPage = () => <div className="text-2xl font-bold  pt-20">ໜ້າຂາຍສິນຄ້າ POS (ຂັ້ນຕອນຖັດໄປ)</div>;
const StockPage = () => <div className="text-2xl font-bold  pt-20">ໜ້າສະຕັອກສິນຄ້າ</div>;
const ReportPage = () => <div className="text-2xl font-bold  pt-20">ໜ້າລາຍງານການຂາຍ</div>;

function App() {
  useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // ປ່ຽນເປັນວິນາທີ

            // ກວດສອບວ່າເວລາປະຈຸບັນ ກາຍເວລາໝົດອາຍຸຂອງ Token ຫຼືຍັງ
            if (decoded.exp < currentTime) {
                handleLogout();
            } else {
                // ຕັ້ງເວລາໃຫ້ Logout ອັດຕະໂນມັດເມື່ອຮອດເວລາໝົດອາຍຸທີ່ເຫຼືອ
                const timeRemaining = (decoded.exp - currentTime) * 1000;
                setTimeout(() => {
                    handleLogout();
                }, timeRemaining);
            }
        }
    }, []);

    const handleLogout = () => {
        alert("Session ຂອງທ່ານໝົດອາຍຸແລ້ວ");
        localStorage.removeItem('token');
        window.location.href = '/login';
    };
  return (
    <Router>
      {/* Container ສຳລັບສະແດງການແຈ້ງເຕືອນ Toast */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/* 1. Public Route: ໜ້າ Login ໃຜກໍ່ເຂົ້າເຖິງໄດ້ */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Protected Routes: ກຸ່ມໜ້າທີ່ຕ້ອງ Login ກ່ອນຈຶ່ງເຂົ້າໄດ້ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* ເສັ້ນທາງຍ່ອຍທີ່ຈະໄປສະແດງໃນ Outlet ຂອງ MainLayout */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/pos" element={<SalePage/>} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/sale-history" element={<SaleHistoryPage />} />
            
            {/* ຖ້າເຂົ້າໜ້າທຳອິດໃຫ້ Redirect ໄປ Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>

        {/* 3. Fallback Route: ຖ້າພິມ URL ຜິດ ໃຫ້ດີດໄປໜ້າ Login */}
        <Route path="*" element={<NotfoundPage/>} />
      </Routes>
    </Router>
  );
}

export default App;