import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteJobPost } from 'entities/jobPost/model/hooks/useJobPostMutations';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import styled from 'styled-components';

interface Props {
  jobPostId: number;
  compact?: boolean;
  onDeleted?: () => void;
}

const DeleteJobPostButton = ({ jobPostId, compact = false, onDeleted }: Props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const { mutate, isPending } = useDeleteJobPost();
  const errorModal = useErrorAlertModal();

  const handleDelete = () => {
    mutate(jobPostId, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        onDeleted?.();
        if (!onDeleted) {
          navigate('/jobposts');
        }
      },
      onError: errorModal.onMutationError('공고 삭제에 실패했습니다.'),
    });
  };

  return (
    <>
      <Button
        type="button"
        scheme="secondary"
        buttonSize={compact ? 'xsmall' : 'small'}
        fontSize="xsmall"
        borderRadius="medium"
        onClick={(e) => {
          e.stopPropagation();
          setIsConfirmOpen(true);
        }}
      >
        {compact ? (
          <>
            <Trash2 size={14} />
            삭제
          </>
        ) : (
          '삭제하기'
        )}
      </Button>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? '삭제 중...' : '삭제하기'}
            </Button>
          </>
        }
      >
        <S.ModalContent>
          <h2>공고를 삭제하시겠습니까?</h2>
          <p>삭제된 공고는 복구할 수 없으며, 관련 지원 내역도 함께 삭제됩니다.</p>
        </S.ModalContent>
      </Modal>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const S = {
  ModalContent: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 40px 0;

    h2 {
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      margin: 0;
    }
    p {
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.color.subText};
      margin: 0;
    }
  `,
};

export default DeleteJobPostButton;
