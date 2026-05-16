import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from 'styled-components';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
}

/** 채용 제안 거절 버튼 (구직자용, API 미구현 — 껍데기) */
export const RejectOfferButton = ({ applicationId }: Props) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    // TODO: 채용 거절 API 연결
    console.log(`채용 거절 요청 (applicationId: ${applicationId})`);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        scheme="secondary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
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
            <Button scheme="primary" buttonSize="medium" onClick={handleConfirm}>
              거절 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 거절</h2>
          <p>해당 공고의 채용을 거절하시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
