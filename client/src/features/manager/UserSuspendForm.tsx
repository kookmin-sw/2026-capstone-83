import { useState } from 'react';
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
      <InputText
        label="정지 일수"
        labelSize="xsmall"
        type="number"
        min={0}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        placeholder="0 = 영구 정지"
      />
      <InputTextarea
        label="정지 사유"
        labelSize="xsmall"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="정지 사유를 입력하세요"
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
