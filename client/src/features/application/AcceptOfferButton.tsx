import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useAcceptOffer } from 'entities/application/model/hooks/useApplication';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  applicationId: number;
}

/** 채용 제안 수락 버튼 (구직자용) */
export const AcceptOfferButton = ({ applicationId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptOffer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorModal = useErrorAlertModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: errorModal.onMutationError('제안 수락에 실패했습니다.'),
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
        수락
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
              수락
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 제안 수락</h2>
          <p>채용 제안을 수락하면 채용 대기 상태가 됩니다. 수락하시겠습니까?</p>
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
