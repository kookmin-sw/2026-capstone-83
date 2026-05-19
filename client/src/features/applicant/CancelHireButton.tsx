import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useCancelHire } from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 채용 취소 버튼 (고용주, HIRED 상태) */
export const CancelHireButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useCancelHire(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  return (
    <>
      <Button
        scheme="secondary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={handleClick}
        disabled={isPending}
      >
        <Undo2 size={14} color={theme.color.error} />
        채용 취소
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={() => setIsModalOpen(false)}>
              돌아가기
            </Button>
            <Button scheme="primary" buttonSize="medium" onClick={handleConfirm} disabled={isPending}>
              채용 취소
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
