import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { SignupRequest } from 'entities/auth/model/types/auth.type';
import type { UserType } from 'entities/user/model/types/user.type';
import { useSignup } from 'entities/auth/model/hooks/useAuth';
import { InputText } from 'shared/ui/Input/InputText';
import Button from 'shared/ui/Button/Button';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import FullLogo from 'shared/assets/FullLogo.svg';
import RoleTabs from './RoleTabs';
import {
  AuthCard,
  AuthForm,
  AuthFooter,
  AuthLink,
  LogoImage,
} from './Auth.styled';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';

const GENDER_OPTIONS = [
  { value: 0, label: '남성' },
  { value: 1, label: '여성' },
];

const SignupForm = () => {
  const [role, setRole] = useState<UserType>('APPLICANT');
  const navigate = useNavigate();
  const { mutate, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupRequest>({
    defaultValues: {
      role: 'APPLICANT',
      gender: 0,
    },
  });

  const selectedGender = watch('gender');

  const handleRoleChange = (newRole: UserType) => {
    setRole(newRole);
    setValue('role', newRole);
  };

  const onSubmit = (data: SignupRequest) => {
    mutate({ ...data, role });
  };

  return (
    <AuthCard>
      <LogoImage src={FullLogo} alt="잇다 로고" />

      <RoleTabs selectedRole={role} onRoleChange={handleRoleChange} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <InputText
          label="이메일"
          labelSize="xsmall"
          placeholder="이메일"
          type="email"
          required
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
          required
          error={errors.password?.message}
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            minLength: { value: 8, message: '8자 이상 입력해주세요.' },
          })}
        />

        <InputText
          label="이름"
          labelSize="xsmall"
          placeholder="이름"
          required
          error={errors.name?.message}
          {...register('name', {
            required: '이름을 입력해주세요.',
          })}
        />

        <InputText
          label="생년월일"
          labelSize="xsmall"
          placeholder="YYYY-MM-DD"
          required
          error={errors.birth?.message}
          {...register('birth', {
            required: '생년월일을 입력해주세요.',
          })}
        />

        <InputText
          label="전화번호"
          labelSize="xsmall"
          placeholder="010-0000-0000"
          required
          error={errors.phone?.message}
          {...register('phone', {
            required: '전화번호를 입력해주세요.',
          })}
        />

        {/* 성별 선택 */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            성별 <span style={{ color: '#CC0000', marginLeft: '0.25rem' }}>*</span>
          </span>
          <ButtonGroup style={{ marginTop: '8px' }}>
            {GENDER_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                scheme={selectedGender === value ? 'optionActive' : 'option'}
                buttonSize="small"
                borderRadius="round"
                onClick={() => setValue('gender', value)}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* 주소 */}
        <div>
          <InputText
            label="주소"
            labelSize="xsmall"
            placeholder="주소를 검색해주세요"
            required
            readOnly
            error={errors.location?.message}
            {...register('location', {
              required: '주소를 입력해주세요.',
            })}
          />
          <ButtonGroup>
            <AddressSearchButton
              onAddressSelect={(address) => setValue('location', address)}
            />
          </ButtonGroup>
        </div>

        {/* 고용주일 때만 사업자번호 노출 */}
        {role === 'EMPLOYER' && (
          <InputText
            label="사업자번호"
            labelSize="xsmall"
            placeholder="000-00-00000"
            error={errors.businessNumber?.message}
            {...register('businessNumber', {
              required: role === 'EMPLOYER' ? '사업자번호를 입력해주세요.' : false,
            })}
          />
        )}

        <Button
          type="submit"
          scheme="primary"
          buttonSize="large"
          borderRadius="medium"
          disabled={isPending}
          style={{ marginTop: '12px' }}
        >
          {isPending ? '가입 중...' : '회원가입'}
        </Button>
      </AuthForm>

      <AuthFooter>
        <span>이미 계정이 있으신가요?</span>
        <AuthLink onClick={() => navigate('/login')}>로그인</AuthLink>
      </AuthFooter>
    </AuthCard>
  );
};

export default SignupForm;
