import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useCloseJobPost } from 'entities/jobPost/model/hooks/useJobPostMutations';
import type { PostStatus } from 'entities/jobPost/model/types/jobPost.type';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  jobPostId: number;
  status: PostStatus;
  compact?: boolean;
  onClosed?: () => void;
}

/** 공고 모집 마감 (고용주, OPEN → CLOSED) */
const CloseJobPostButton = ({ jobPostId, status, compact = true, onClosed }: Props) => {
  const { mutate, isPending } = useCloseJobPost();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorModal = useErrorAlertModal();

  if (status !== 'OPEN') {
    return null;
  }

  const handleConfirm = () => {
    mutate(jobPostId, {
      onSuccess: () => {
        setIsModalOpen(false);
        onClosed?.();
      },
      onError: errorModal.onMutationError('공고 마감에 실패했습니다.'),
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
          setIsModalOpen(true);
        }}
        disabled={isPending}
      >
        <Lock size={14} />
        {compact ? '마감' : '공고 마감'}
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
              {isPending ? '처리 중...' : '마감하기'}
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>공고 마감</h2>
          <p>
            마감하면 새 지원·제안을 받을 수 없습니다.
            <br />
            이미 채용된 인원의 근무 완료 처리는 지원자 목록에서 따로 진행할 수 있습니다.
          </p>
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

export default CloseJobPostButton;
