import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

type ErrorAlertModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

/** API 오류 등 사용자 알림용 단순 모달 */
const ErrorAlertModal = ({
  isOpen,
  title = '요청을 처리할 수 없습니다',
  message,
  onClose,
}: ErrorAlertModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    actions={
      <Button scheme="primary" buttonSize="medium" borderRadius="medium" onClick={onClose}>
        확인
      </Button>
    }
  >
    <ModalContent>
      <h2>{title}</h2>
      <p>{message}</p>
    </ModalContent>
  </Modal>
);

export default ErrorAlertModal;
