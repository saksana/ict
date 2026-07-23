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

// Placeholders
const Dashboard = () => <div className="text-2xl font-bold pt-20">ໜ້າ Dashboard (ກຳລັງພັດທະນາ)</div>;
const StockPage = () => <div className="text-2xl font-bold pt-20">ໜ້າສະຕັອກສິນຄ້າ</div>;
const ReportPage = () => <div className="text-2xl font-bold pt-20">ໜ້າລາຍງານການຂາຍ</div>;

// Component ສຳລັບ Redirect ໜ້າທຳອິດ (`/`) ຕາມ Role
const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    // ຖ້າເປັນ user ໃຫ້ໄປ /pos ຖ້າເປັນ admin ໃຫ້ໄປ /dashboard
    return decoded.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/pos" replace />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          handleLogout();
        } else {
          const timeRemaining = (decoded.exp - currentTime) * 1000;
          const timer = setTimeout(() => {
            handleLogout();
          }, timeRemaining);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    alert("Session ຂອງທ່ານໝົດອາຍຸແລ້ວ");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
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
        {/* 1. Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Protected Routes */}
        <Route element={<MainLayout />}>
          
          {/* A. ໜ້າທີ່ເຂົ້າໄດ້ທັງ Admin ແລະ User */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sale']} />}>
            <Route path="/pos" element={<SalePage />} />
            <Route path="/" element={<HomeRedirect />} />
          </Route>

          {/* B. ໜ້າທີ່ເຂົ້າໄດ້ສະເພາະ Admin ເທົ່ານັ້ນ */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/sale-history" element={<SaleHistoryPage />} />
          </Route>

        </Route>

        {/* 3. Fallback Route */}
        <Route path="*" element={<NotfoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;