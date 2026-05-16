import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useAcceptOffer } from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
}

/** 채용 제안 수락 버튼 (구직자용) */
export const AcceptOfferButton = ({ applicationId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptOffer();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId);
    setIsModalOpen(false);
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
              승인 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 승인</h2>
          <p>해당 공고의 채용을 승인하시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
