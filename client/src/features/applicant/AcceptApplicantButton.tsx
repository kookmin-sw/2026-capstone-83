import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useAcceptApplicant } from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 지원자 채용 승인 버튼 */
export const AcceptApplicantButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptApplicant(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId);
    setIsModalOpen(false);
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
        채용
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
              채용 확정
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>채용 승인</h2>
          <p>해당 지원자를 채용하시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
