import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useCompleteWork } from 'entities/application/model/hooks/useApplication';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  applicationId: number;
  jobPostId: number;
  applicantName?: string;
}

/** 근무 완료 처리 (고용주, HIRED → COMPLETED) */
export const CompleteWorkButton = ({ applicationId, jobPostId, applicantName }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useCompleteWork(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorModal = useErrorAlertModal();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
      onError: errorModal.onMutationError('근무 완료 처리에 실패했습니다.'),
    });
  };

  const targetLabel = applicantName ? `${applicantName} 님의 ` : '';

  return (
    <>
      <Button
        scheme="primary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
        disabled={isPending}
      >
        <CircleCheck size={14} color={theme.color.white} />
        근무 완료
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button scheme="primary" buttonSize="medium" onClick={handleConfirm} disabled={isPending}>
              {isPending ? '처리 중...' : '완료 처리'}
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>근무 완료</h2>
          <p>
            {targetLabel}근무를 완료 처리하면 리뷰를 작성할 수 있고, 지원 상태가 근무 완료로 변경됩니다.
            <br />
            완료 후에는 채용 취소가 불가합니다.
          </p>
        </ModalContent>
      </Modal>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};
