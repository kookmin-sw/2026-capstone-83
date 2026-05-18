import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from 'entities/auth/model/store/authStore';

const ManagerGuard = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ManagerGuard;
