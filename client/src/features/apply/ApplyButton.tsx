import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRoundPlus } from 'lucide-react';
import { useApply } from 'entities/application/model/hooks/useApply';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import Button from 'shared/ui/Button/Button';
import Modal from 'shared/ui/Modal/Modal';
import styled from 'styled-components';

interface Props {
  jobPostId: number;
}

const ApplyButton = ({ jobPostId }: Props) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);
  const { mutate, isPending } = useApply();

  const handleClick = () => {
    if (!isLoggedIn || role !== 'APPLICANT') {
      setIsLoginModalOpen(true);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApply = () => {
    mutate(jobPostId, {
      onSuccess: () => {
        setIsApplyModalOpen(false);
        alert('지원이 완료되었습니다.');
      },
      onError: () => {
        alert('지원에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <>
      <Button
        scheme="primary"
        buttonSize="medium"
        onClick={handleClick}
        style={{ width: '100%', }}
      >
        <UserRoundPlus size={16} style={{ marginRight: '6px' }} />
        지원하기
      </Button>

      {/* 지원 확인 모달 */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsApplyModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={handleApply}
              disabled={isPending}
            >
              <UserRoundPlus size={16} style={{ marginRight: '6px' }} />
              {isPending ? '지원 중...' : '지원하기'}
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원하시겠습니까?</h2>
          <p>해당 공고에 지원합니다. 지원 후 취소는 불가합니다.</p>
        </ModalContent>
      </Modal>

      {/* 로그인 유도 모달 */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsLoginModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/login');
              }}
            >
              로그인하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>구직자 회원 기능</h2>
          <p>지원하려면 구직자 회원으로 로그인해주세요.</p>
        </ModalContent>
      </Modal>
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 40px 0;

  h2 {
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  }

  p {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  }
`;

export default ApplyButton;
