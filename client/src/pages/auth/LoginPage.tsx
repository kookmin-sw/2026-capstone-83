import LoginForm from 'features/auth/ui/LoginForm';
import { AuthPageBackground } from 'features/auth/ui/Auth.styled';

const LoginPage = () => {
  return (
    <AuthPageBackground>
      <LoginForm />
    </AuthPageBackground>
  );
};

export default LoginPage;
