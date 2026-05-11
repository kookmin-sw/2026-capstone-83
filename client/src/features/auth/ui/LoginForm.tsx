import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginRequest } from 'entities/auth/model/types/auth.type';
import type { UserType } from 'entities/user/model/types/user.type';
import { useLogin } from 'entities/auth/model/hooks/useAuth';
import { InputText } from 'shared/ui/Input/InputText';
import Button from 'shared/ui/Button/Button';
import FullLogo from 'shared/assets/FullLogo.svg';
import RoleTabs from './RoleTabs';
import {
  AuthCard,
  AuthForm,
  AuthFooter,
  AuthLink,
  LogoImage,
} from './Auth.styled';

const LoginForm = () => {
  const [role, setRole] = useState<UserType>('APPLICANT');
  const navigate = useNavigate();
  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    // defaultValues: {
    //   role: 'APPLICANT',
    // },
  });

  const onSubmit = (data: LoginRequest) => {
    // role은 폼이 아닌 상단 RoleTabs 상태에서 가져와 합쳐 전송
    mutate({ ...data, role });
  };

  return (
    <AuthCard>
      <Link to={'/'}>
        <LogoImage src={FullLogo} alt="잇다 로고" />
      </Link>

      <RoleTabs selectedRole={role} onRoleChange={setRole} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <InputText
          label="이메일"
          labelSize="xsmall"
          placeholder="이메일"
          type="email"
          error={errors.email?.message}
          {...register('email', {
            required: '이메일을 입력해주세요.',
          })}
        />

        <InputText
          label="비밀번호"
          labelSize="xsmall"
          placeholder="비밀번호"
          type="password"
          error={errors.password?.message}
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
          })}
        />

        <Button
          type="submit"
          scheme="primary"
          buttonSize="large"
          borderRadius="medium"
          disabled={isPending}
          style={{ marginTop: '12px' }}
        >
          {isPending ? '로그인 중...' : '로그인'}
        </Button>
      </AuthForm>

      <AuthFooter>
        <span>처음이신가요?</span>
        <AuthLink onClick={() => navigate('/signup')}>회원가입</AuthLink>
      </AuthFooter>
    </AuthCard>
  );
};

export default LoginForm;
