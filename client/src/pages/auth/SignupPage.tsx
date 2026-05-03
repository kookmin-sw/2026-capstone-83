import SignupForm from 'features/auth/ui/SignupForm';
import { AuthPageBackground } from 'features/auth/ui/Auth.styled';

const SignupPage = () => {
  return (
    <AuthPageBackground>
      <SignupForm />
    </AuthPageBackground>
  );
};

export default SignupPage;
