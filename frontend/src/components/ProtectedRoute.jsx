import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // ຖ້າບໍ່ມີ Token ໃຫ້ສົ່ງກັບໄປໜ້າ login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ຖ້າມີ Token ໃຫ້ສະແດງໜ້າເວັບທີ່ຢູ່ຂ້າງໃນ (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;