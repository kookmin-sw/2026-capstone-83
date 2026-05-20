import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import {
  getApplicationMutationErrorMessage,
  useConfirmHire,
} from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 고용주 최종 확정 (PENDING → HIRED, 제안 플로우) */
export const ConfirmHireButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useConfirmHire(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => {
        alert(getApplicationMutationErrorMessage(error) ?? '최종 확정에 실패했습니다.');
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
        채용 확정
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
    </>
  );
};
