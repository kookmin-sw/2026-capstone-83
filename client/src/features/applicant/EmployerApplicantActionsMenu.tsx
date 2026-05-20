import { useMemo, useState } from 'react';
import type { ApplicationStatus } from 'entities/application/model/types/application.type';
import {
  getApplicationMutationErrorMessage,
  useAcceptApplicant,
  useCancelHire,
  useConfirmHire,
  useOfferJobPost,
  useRejectApplicant,
} from 'entities/application/model/hooks/useApplication';
import { CardActionsMenu, type CardMenuItem } from 'shared/ui/CardActionsMenu/CardActionsMenu';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

type ModalType = 'accept' | 'confirmHire' | 'reject' | 'offer' | 'cancelHire' | null;

interface Props {
  applicationId: number;
  jobPostId: number;
  userId: number;
  status: ApplicationStatus;
}

export const EmployerApplicantActionsMenu = ({
  applicationId,
  jobPostId,
  userId,
  status,
}: Props) => {
  const [modal, setModal] = useState<ModalType>(null);
  const { mutate: acceptApplicant, isPending: isAcceptPending } = useAcceptApplicant(jobPostId);
  const { mutate: confirmHire, isPending: isConfirmPending } = useConfirmHire(jobPostId);
  const { mutate: rejectApplicant, isPending: isRejectPending } = useRejectApplicant(jobPostId);
  const { mutate: offerJob, isPending: isOfferPending } = useOfferJobPost(jobPostId);
  const { mutate: cancelHire, isPending: isCancelHirePending } = useCancelHire(jobPostId);

  const menuItems: CardMenuItem[] = useMemo(() => {
    switch (status) {
      case 'APPLIED':
        return [
          { label: '지원 승인', onClick: () => setModal('accept'), tone: 'primary' },
          { label: '거절', onClick: () => setModal('reject'), tone: 'danger' },
        ];
      case 'OFFERED':
        return [{ label: '거절', onClick: () => setModal('reject'), tone: 'danger' }];
      case 'PENDING':
        return [
          { label: '채용 확정', onClick: () => setModal('confirmHire'), tone: 'primary' },
          { label: '거절', onClick: () => setModal('reject'), tone: 'danger' },
        ];
      case 'REJECTED':
        return [{ label: '채용 제안', onClick: () => setModal('offer'), tone: 'primary' }];
      case 'HIRED':
        return [{ label: '채용 취소', onClick: () => setModal('cancelHire'), tone: 'danger' }];
      default:
        return [];
    }
  }, [status]);

  if (menuItems.length === 0) return null;

  const closeModal = () => setModal(null);

  return (
    <>
      <CardActionsMenu items={menuItems} ariaLabel="지원자 작업 메뉴" />

      <Modal
        isOpen={modal === 'accept'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={() => acceptApplicant(applicationId, { onSuccess: closeModal })}
              disabled={isAcceptPending}
            >
              승인
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원 승인</h2>
          <p>지원을 승인하면 채용 대기 상태가 됩니다. 구직자의 최종 수락을 기다립니다.</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'confirmHire'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={() =>
                confirmHire(applicationId, {
                  onSuccess: closeModal,
                  onError: (error) => {
                    alert(getApplicationMutationErrorMessage(error) ?? '최종 확정에 실패했습니다.');
                  },
                })
              }
              disabled={isConfirmPending}
            >
              확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>최종 채용 확정</h2>
          <p>구직자가 제안을 수락했습니다. 채용을 최종 확정하시겠습니까?</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'reject'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={() => rejectApplicant(applicationId, { onSuccess: closeModal })}
              disabled={isRejectPending}
            >
              거절 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원 거절</h2>
          <p>해당 지원자를 거절하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'offer'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={() =>
                offerJob(userId, {
                  onSuccess: () => {
                    closeModal();
                    alert('채용 제안이 전송되었습니다.');
                  },
                  onError: (error) => {
                    alert(getApplicationMutationErrorMessage(error) ?? '제안 전송에 실패했습니다.');
                  },
                })
              }
              disabled={isOfferPending}
            >
              제안하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>고용 제안</h2>
          <p>선택한 공고로 채용 제안을 보내시겠습니까?</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'cancelHire'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={() => cancelHire(applicationId, { onSuccess: closeModal })}
              disabled={isCancelHirePending}
            >
              확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 취소</h2>
          <p>해당 지원자의 채용을 취소하시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
