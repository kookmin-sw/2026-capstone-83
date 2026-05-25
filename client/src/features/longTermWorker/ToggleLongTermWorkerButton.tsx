import { Star } from 'lucide-react';
import {
  useLongTermWorkerStatus,
  useToggleLongTermWorker,
} from 'entities/longTermWorker/model/hooks/useLongTermWorker';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  applicantUserId: number;
  buttonSize?: 'small' | 'medium';
  stopPropagation?: boolean;
}

export const ToggleLongTermWorkerButton = ({
  applicantUserId,
  buttonSize = 'small',
  stopPropagation = false,
}: Props) => {
  const { data, isLoading } = useLongTermWorkerStatus(applicantUserId);
  const { mutate, isPending } = useToggleLongTermWorker(applicantUserId);
  const errorModal = useErrorAlertModal();

  const isLongTerm = data?.longTerm ?? false;

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    mutate(undefined, {
      onError: errorModal.onMutationError('장기근무 설정에 실패했습니다.'),
    });
  };

  return (
    <>
      <Button
        scheme={isLongTerm ? 'primary' : 'secondary'}
        buttonSize={buttonSize}
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
        disabled={isLoading || isPending}
        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        <Star size={14} fill={isLongTerm ? 'currentColor' : 'none'} style={{ marginRight: 4 }} />
        {isLongTerm ? '장기근무' : '장기근무 등록'}
      </Button>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};
