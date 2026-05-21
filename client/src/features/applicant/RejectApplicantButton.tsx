import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useRejectApplicant } from 'entities/application/model/hooks/useApplication';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 지원자 거절 버튼 */
export const RejectApplicantButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useRejectApplicant(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorModal = useErrorAlertModal();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
      onError: errorModal.onMutationError('거절 처리에 실패했습니다.'),
    });
  };

  return (
    <>
      <Button
        scheme="secondary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
        disabled={isPending}
      >
        <X size={14} color={theme.color.error} />
        거절
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
              거절 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원 거절</h2>
          <p>해당 지원자를 거절하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
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
