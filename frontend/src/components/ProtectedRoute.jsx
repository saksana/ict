import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');

    // 1. ຖ້າບໍ່ມີ Token ໃຫ້Redirect ໄປໜ້າ Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // ດຶງຂໍ້ມູນ role ຈາກ Token (ຫຼື ຈະດຶງຈາກ localStorage.getItem('user') ກໍໄດ້)
        const decoded = jwtDecode(token);
        const userRole = decoded.role; 

        // 2. ຖ້າມີການກຳນົດ allowedRoles ແລ້ວ userRole ບໍ່ກົງກັບທີ່ມີສິດ
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // Send standard User to POS if trying to access unauthorized routes
            return <Navigate to="/pos" replace />;
        }

        // 3. ຖ້າຜ່ານທຸກເງື່ອນໄຂ ໃຫ້ສະແດງ Route ທາງໃນ (Outlet)
        return <Outlet />;
    } catch (error) {
        // ຖ້າ Token ມີບັນຫາ/ຖອກລືມ
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;