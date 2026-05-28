import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { EmployerOnlyResumeListModal } from 'features/resume/EmployerOnlyResumeListModal';

/** 인재 목록(/resumes) — 고용주·관리자만 접근 */
const EmployerResumeListGuard = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);

  const canAccess =
    isLoggedIn && (role === 'EMPLOYER' || role === 'MANAGER');

  if (canAccess) {
    return <Outlet />;
  }

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  return (
    <EmployerOnlyResumeListModal
      isOpen
      onClose={handleClose}
      isLoggedIn={isLoggedIn}
    />
  );
};

export default EmployerResumeListGuard;
