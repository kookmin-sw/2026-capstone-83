import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import styled, { useTheme } from 'styled-components';
import { useDeleteWorkplace } from 'entities/workplace/model/hooks/useWorkplace';
import { hoverOverlay } from 'shared/styles/hoverOverlay';
import Modal from 'shared/ui/Modal/Modal';
import Button from 'shared/ui/Button/Button';

interface Props {
  workplaceId: number;
}

const DeleteWorkplaceButton = ({ workplaceId }: Props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate, isPending } = useDeleteWorkplace();
  const theme = useTheme();

  const handleDelete = () => {
    mutate(workplaceId, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        alert('작업장이 삭제되었습니다.');
      },
      onError: () => {
        alert('작업장 삭제에 실패했습니다.');
      },
    });
  };

  return (
    <>
      <S.Button onClick={(e) => { e.stopPropagation(); setIsConfirmOpen(true); }}>
        <Trash2 size={16} color={theme.color.error} />
        <span style={{ color: theme.color.error }}>삭제하기</span>
      </S.Button>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        actions={
          <>
            <Button scheme="secondary" buttonSize="large" borderRadius="medium" onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button scheme="primary" buttonSize="large" borderRadius="medium" onClick={handleDelete} disabled={isPending}>
              {isPending ? '삭제 중...' : '삭제하기'}
            </Button>
          </>
        }
      >
        <S.ModalContent>
          <h2>작업장을 삭제하시겠습니까?</h2>
          <p>삭제된 작업장은 복구할 수 없습니다.</p>
        </S.ModalContent>
      </Modal>
    </>
  );
};

const S = {
  Button: styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 16px;
    flex: 1;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.error};
    cursor: pointer;
    transition: all 0.15s ease;

    svg {
      color: ${({ theme }) => theme.color.error};
    }

    ${hoverOverlay}
  `,
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
    }
    p {
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.color.subText};
    }
  `,
};

export default DeleteWorkplaceButton;
