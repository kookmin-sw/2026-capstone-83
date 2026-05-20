import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import {
  getApplicationMutationErrorMessage,
  useAcceptApproval,
} from 'entities/application/model/hooks/useApplication';
import { clearPendingFlowFlag } from 'entities/application/lib/pendingFlowStorage';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
}

/** 구직자 최종 수락 (PENDING → HIRED, 지원 플로우) */
export const AcceptApprovalButton = ({ applicationId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptApproval();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => {
        clearPendingFlowFlag(applicationId);
        setIsModalOpen(false);
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

  return (
    <>
      <Button
        scheme="primary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
        disabled={isPending}
      >
        <Check size={14} color={theme.color.white} />
        최종 수락
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
    </>
  );
};
