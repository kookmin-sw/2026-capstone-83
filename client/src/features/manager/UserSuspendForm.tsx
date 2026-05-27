import { useState } from 'react';
import styled from 'styled-components';
import { useSuspendUser } from 'entities/manager/model/hooks/useManagerQueries';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { InputText } from 'shared/ui/Input/InputText';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import { ActionRow } from 'widgets/manager/admin.styled';

interface Props {
  userId: number;
  onSuccess?: () => void;
}

const UserSuspendForm = ({ userId, onSuccess }: Props) => {
  const [days, setDays] = useState('7');
  const [reason, setReason] = useState('');
  const { mutate, isPending } = useSuspendUser(userId);
  const errorModal = useErrorAlertModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDays = Number(days);
    if (!reason.trim()) {
      alert('정지 사유를 입력해주세요.');
      return;
    }
    if (Number.isNaN(parsedDays) || parsedDays < 0) {
      alert('정지 일수를 올바르게 입력해주세요.');
      return;
    }

    const label = parsedDays === 0 ? '영구 정지' : `${parsedDays}일 정지`;
    if (!window.confirm(`${label} 처리하시겠습니까?`)) return;

    mutate(
      { days: parsedDays, reason: reason.trim() },
      {
        onSuccess: () => {
          alert('정지 처리되었습니다.');
          setReason('');
          onSuccess?.();
        },
        onError: errorModal.onMutationError('정지 처리에 실패했습니다.'),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <S.HintList>
        <li>정지 일수에 <strong>0</strong>을 입력하면 <strong>영구 정지</strong>입니다. 1 이상이면 그 일수만큼만 정지됩니다.</li>
        <li>정지 사유는 <strong>필수</strong>입니다.</li>
      </S.HintList>
      <InputText
        label="정지 일수"
        labelSize="xsmall"
        type="number"
        min={0}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        placeholder="예: 7 (0이면 영구)"
      />
      <InputTextarea
        label="정지 사유"
        labelSize="xsmall"
        name="suspend-reason"
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="정지 사유를 입력하세요 (필수)"
        rows={3}
      />
      <ActionRow>
        <Button
          type="submit"
          scheme="primary"
          buttonSize="medium"
          borderRadius="medium"
          disabled={isPending}
        >
          {isPending ? '처리 중...' : '정지 처리'}
        </Button>
      </ActionRow>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </form>
  );
};

export default UserSuspendForm;

const S = {
  HintList: styled.ul`
    margin: 0 0 16px;
    padding-left: 18px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.55;

    strong {
      color: ${({ theme }) => theme.color.text};
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
    }
  `,
};
