import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import type { ApplicationStatus } from 'entities/application/model/types/application.type';
import {
  getApplicationMutationErrorMessage,
  useAcceptApproval,
  useAcceptOffer,
  useCancelApplication,
} from 'entities/application/model/hooks/useApplication';
import {
  clearPendingFlowFlag,
  isPendingAfterOfferAccept,
  markPendingAfterOfferAccept,
} from 'entities/application/lib/pendingFlowStorage';
import { CardActionsMenu, type CardMenuItem } from 'shared/ui/CardActionsMenu/CardActionsMenu';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

type ModalType = 'acceptOffer' | 'acceptApproval' | 'cancel' | null;

interface Props {
  applicationId: number;
  status: ApplicationStatus;
}

export const WorkerApplicationActionsMenu = ({ applicationId, status }: Props) => {
  const [modal, setModal] = useState<ModalType>(null);
  const { mutate: acceptOffer, isPending: isOfferPending } = useAcceptOffer();
  const { mutate: acceptApproval, isPending: isApprovalPending } = useAcceptApproval();
  const { mutate: cancelApplication, isPending: isCancelPending } = useCancelApplication();

  const waitingEmployer = status === 'PENDING' && isPendingAfterOfferAccept(applicationId);

  const menuItems: CardMenuItem[] = useMemo(() => {
    switch (status) {
      case 'OFFERED':
        return [
          { label: '제안 수락', onClick: () => setModal('acceptOffer'), tone: 'primary' },
          { label: '지원/제안 취소', onClick: () => setModal('cancel'), tone: 'danger' },
        ];
      case 'PENDING':
        if (waitingEmployer) {
          return [{ label: '지원/제안 취소', onClick: () => setModal('cancel'), tone: 'danger' }];
        }
        return [
          { label: '최종 수락', onClick: () => setModal('acceptApproval'), tone: 'primary' },
          { label: '지원/제안 취소', onClick: () => setModal('cancel'), tone: 'danger' },
        ];
      case 'APPLIED':
        return [{ label: '지원/제안 취소', onClick: () => setModal('cancel'), tone: 'danger' }];
      default:
        return [];
    }
  }, [status, waitingEmployer]);

  if (menuItems.length === 0 && !waitingEmployer) return null;

  const closeModal = () => setModal(null);

  const handleAcceptOffer = () => {
    acceptOffer(applicationId, {
      onSuccess: () => {
        markPendingAfterOfferAccept(applicationId);
        closeModal();
      },
      onError: (error) => {
        alert(getApplicationMutationErrorMessage(error) ?? '제안 수락에 실패했습니다.');
      },
    });
  };

  const handleAcceptApproval = () => {
    acceptApproval(applicationId, {
      onSuccess: () => {
        clearPendingFlowFlag(applicationId);
        closeModal();
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          alert('고용주의 최종 확정을 기다려 주세요.');
          return;
        }
        alert(getApplicationMutationErrorMessage(error) ?? '최종 수락에 실패했습니다.');
      },
    });
  };

  const handleCancel = () => {
    cancelApplication(applicationId, {
      onSuccess: closeModal,
      onError: (error) => {
        alert(getApplicationMutationErrorMessage(error) ?? '취소에 실패했습니다.');
      },
    });
  };

  return (
    <>
      <CardActionsMenu
        items={menuItems}
        notice={waitingEmployer ? '고용주 최종 확정을 기다리는 중입니다.' : undefined}
      />

      <Modal
        isOpen={modal === 'acceptOffer'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              닫기
            </Button>
            <Button scheme="primary" buttonSize="medium" onClick={handleAcceptOffer} disabled={isOfferPending}>
              수락
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 제안 수락</h2>
          <p>채용 제안을 수락하면 채용 대기 상태가 됩니다. 수락하시겠습니까?</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'acceptApproval'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              닫기
            </Button>
            <Button
              scheme="primary"
              buttonSize="medium"
              onClick={handleAcceptApproval}
              disabled={isApprovalPending}
            >
              수락
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 최종 수락</h2>
          <p>고용주 승인을 확인했습니다. 채용을 최종 수락하시겠습니까?</p>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal === 'cancel'}
        onClose={closeModal}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={closeModal}>
              닫기
            </Button>
            <Button scheme="primary" buttonSize="medium" onClick={handleCancel} disabled={isCancelPending}>
              취소 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>지원/제안 취소</h2>
          <p>이 지원·제안을 취소하시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
