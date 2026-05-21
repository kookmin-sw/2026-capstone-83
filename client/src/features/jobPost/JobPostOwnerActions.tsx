import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloseJobPost, useDeleteJobPost } from 'entities/jobPost/model/hooks/useJobPostMutations';
import type { PostStatus } from 'entities/jobPost/model/types/jobPost.type';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import { CardActionsMenu, type CardMenuItem } from 'shared/ui/CardActionsMenu/CardActionsMenu';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import styled from 'styled-components';

type ModalType = 'close' | 'delete' | null;

interface Props {
  jobPostId: number;
  status?: PostStatus;
  onDeleted?: () => void;
  onClosed?: () => void;
}

export const JobPostOwnerActions = ({
  jobPostId,
  status,
  onDeleted,
  onClosed,
}: Props) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalType>(null);
  const errorModal = useErrorAlertModal();
  const { mutate: closeJobPost, isPending: isClosing } = useCloseJobPost();
  const { mutate: deleteJobPost, isPending: isDeleting } = useDeleteJobPost();

  const menuItems: CardMenuItem[] = useMemo(() => {
    const items: CardMenuItem[] = [];
    if (status === 'OPEN') {
      items.push({ label: '공고 마감', onClick: () => setModal('close') });
    }
    items.push({ label: '수정', onClick: () => navigate(`/jobpost/${jobPostId}/edit`) });
    items.push({ label: '삭제', onClick: () => setModal('delete'), tone: 'danger' });
    return items;
  }, [status, jobPostId, navigate]);

  const closeModal = () => setModal(null);

  const handleCloseConfirm = () => {
    closeJobPost(jobPostId, {
      onSuccess: () => {
        closeModal();
        onClosed?.();
      },
      onError: errorModal.onMutationError('공고 마감에 실패했습니다.'),
    });
  };

  const handleDeleteConfirm = () => {
    deleteJobPost(jobPostId, {
      onSuccess: () => {
        closeModal();
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
      <CardActionsMenu items={menuItems} ariaLabel="공고 작업 메뉴" />

      <Modal
        isOpen={modal === 'close'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={handleCloseConfirm}
              disabled={isClosing}
            >
              {isClosing ? '처리 중...' : '마감하기'}
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

      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제하기'}
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
