import { Trash2 } from 'lucide-react';
import styled, { useTheme } from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  workplaceId: number;
}

const DeleteWorkplaceButton = ({ workplaceId }: Props) => {

  const theme = useTheme();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 추후 삭제 API 연결
    console.log('삭제 요청:', workplaceId);
  };

  return (
    <S.Button onClick={handleDelete}>
      <Trash2 size={16} color={theme.color.error} />
      <span>삭제하기</span>
    </S.Button>
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

    span {
      color: ${({ theme }) => theme.color.error};
    }

    svg {
      color: ${({ theme }) => theme.color.error};
    }

    ${hoverOverlay}
  `,
};

export default DeleteWorkplaceButton;
