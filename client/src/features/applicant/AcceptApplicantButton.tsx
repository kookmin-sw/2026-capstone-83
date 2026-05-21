import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useAcceptApplicant } from 'entities/application/model/hooks/useApplication';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 지원자 채용 승인 버튼 */
export const AcceptApplicantButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptApplicant(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorModal = useErrorAlertModal();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
      onError: errorModal.onMutationError('승인에 실패했습니다.'),
    });
  };

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
        <Check size={14} color={theme.color.white} />
        승인
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
              승인
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원 승인</h2>
          <p>지원을 승인하면 채용 대기 상태가 됩니다. 구직자의 최종 수락을 기다립니다.</p>
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
