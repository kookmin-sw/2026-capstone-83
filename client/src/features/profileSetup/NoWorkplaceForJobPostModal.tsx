import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const NoWorkplaceForJobPostModal = ({ isOpen, onClose, onConfirm }: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    actions={
      <>
        <Button scheme="secondary" buttonSize="large" borderRadius="medium" onClick={onClose}>
          취소
        </Button>
        <Button scheme="primary" buttonSize="large" borderRadius="medium" onClick={onConfirm}>
          확인
        </Button>
      </>
    }
  >
    <ModalContent>
      <h2>작업장 등록이 필요합니다</h2>
      <p>공고를 등록하려면 먼저 작업장을 등록해주세요.</p>
    </ModalContent>
  </Modal>
);
