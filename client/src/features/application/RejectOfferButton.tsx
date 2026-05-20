import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from 'styled-components';
import {
  getApplicationMutationErrorMessage,
  useCancelApplication,
} from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

type CancelVariant = 'application' | 'hired';

const COPY: Record<
  CancelVariant,
  { label: string; title: string; description: string; confirmLabel: string }
> = {
  application: {
    label: '취소',
    title: '지원/제안 취소',
    description: '이 지원·제안을 취소하시겠습니까?',
    confirmLabel: '취소 확정',
  },
  hired: {
    label: '채용 취소',
    title: '채용 취소',
    description: '확정된 채용을 취소하시겠습니까?',
    confirmLabel: '채용 취소',
  },
};

interface Props {
  applicationId: number;
  /** hired: HIRED 상태 채용 취소 (cancel API) */
  variant?: CancelVariant;
}

/** 지원/제안/채용 취소 (구직자, cancel API) */
export const RejectOfferButton = ({ applicationId, variant = 'application' }: Props) => {
  const copy = COPY[variant];
  const theme = useTheme();
  const { mutate, isPending } = useCancelApplication();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    mutate(applicationId, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => {
        alert(getApplicationMutationErrorMessage(error) ?? '취소에 실패했습니다.');
      },
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
        <X size={14} color={theme.color.error} />
        {copy.label}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button scheme="secondary" buttonSize="medium" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
            <Button scheme="primary" buttonSize="medium" onClick={handleConfirm} disabled={isPending}>
              {copy.confirmLabel}
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </ModalContent>
      </Modal>
    </>
  );
};
