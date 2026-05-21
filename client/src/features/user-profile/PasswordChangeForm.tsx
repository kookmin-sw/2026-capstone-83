import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useChangePassword } from 'entities/user/model/hooks/useUserProfile';
import type { PasswordChangeRequest } from 'entities/user/model/types/userProfile.type';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import { InputText } from 'shared/ui/Input/InputText';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import Button from 'shared/ui/Button/Button';

export const PasswordChangeForm = () => {
  const { mutate, isPending } = useChangePassword();
  const errorModal = useErrorAlertModal();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordChangeRequest>();

  const onSubmit = (data: PasswordChangeRequest) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        alert('비밀번호가 변경되었습니다.');
      },
      onError: errorModal.onMutationError(
        '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.',
      ),
    });
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <InputText
        label="현재 비밀번호"
        labelSize="small"
        type="password"
        placeholder="현재 비밀번호"
        error={errors.currentPassword?.message}
        {...register('currentPassword', { required: '현재 비밀번호를 입력해주세요.' })}
      />
      <InputText
        label="새 비밀번호"
        labelSize="small"
        type="password"
        placeholder="8자 이상"
        error={errors.newPassword?.message}
        {...register('newPassword', {
          required: '새 비밀번호를 입력해주세요.',
          minLength: { value: 8, message: '8자 이상 입력해주세요.' },
        })}
      />
      <S.Actions>
        <Button type="submit" scheme="secondary" buttonSize="small" disabled={isPending}>
          {isPending ? '변경 중...' : '비밀번호 변경'}
        </Button>
      </S.Actions>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </S.Form>
  );
};

const S = {
  Form: styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
  `,
  Actions: styled.div`
    display: flex;
    justify-content: flex-end;
  `,
};
