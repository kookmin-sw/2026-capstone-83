import { Outlet } from 'react-router-dom';
import { AuthPageBackground } from 'features/auth/ui/Auth.styled';

const AuthLayout = () => {
  return (
    <AuthPageBackground>
      <Outlet />
    </AuthPageBackground>
  );
};

export default AuthLayout;
