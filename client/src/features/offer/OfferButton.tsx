import { useState } from 'react';
import { UserRoundPlus } from 'lucide-react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  resumeId: number;
}

const OfferButton = ({ resumeId }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const role = useAuthStore((s) => s.role);

  // 고용주만 보이도록
  if (role !== 'EMPLOYER') return null;

  const handleConfirm = () => {
    setIsModalOpen(false);
    alert(`고용 제안이 전송되었습니다. (resumeId: ${resumeId})`);
  };

  return (
    <>
      <Button
        scheme="icon"
        buttonSize="small"
        borderRadius="medium"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
      >
        <UserRoundPlus size={16} />
        고용 제안
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={handleConfirm}
            >
              <UserRoundPlus size={16} />
              제안하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>고용 제안</h2>
          <p>고용 제안을 보내시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OfferButton;
