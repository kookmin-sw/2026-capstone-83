import { useNavigate } from 'react-router-dom';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** false: 비로그인 — 로그인 유도 */
  isLoggedIn: boolean;
}

export const EmployerOnlyResumeListModal = ({ isOpen, onClose, isLoggedIn }: Props) => {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        isLoggedIn ? (
          <Button scheme="primary" buttonSize="large" borderRadius="medium" onClick={onClose}>
            확인
          </Button>
        ) : (
          <>
            <Button scheme="secondary" buttonSize="large" borderRadius="medium" onClick={onClose}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
            >
              로그인하기
            </Button>
          </>
        )
      }
    >
      <ModalContent>
        <h2>고용주 전용 기능</h2>
        <p>
          인재 찾기는 고용주 회원만 이용할 수 있습니다.
          <br />
          {isLoggedIn
            ? '고용주 계정으로 로그인해 주세요.'
            : '고용주 계정으로 로그인 후 이용해 주세요.'}
        </p>
      </ModalContent>
    </Modal>
  );
};
