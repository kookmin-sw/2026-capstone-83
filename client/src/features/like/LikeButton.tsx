import { useState } from 'react';
import { Heart } from 'lucide-react';
import styled, { useTheme } from 'styled-components';

interface Props {
  liked: boolean;
  onToggle: () => void;
  variant?: 'icon' | 'bordered';
}

/**
 * 공통 좋아요 버튼
 * - variant="icon": 아이콘만 (카드용)
 * - variant="bordered": border 있는 버전 (섹션/스티키바용)
 * - onToggle: 외부에서 mutation 호출
 */
const LikeButton = ({ liked, onToggle, variant = 'bordered' }: Props) => {
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const theme = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticLiked((prev) => !prev);
    onToggle();
  };

  if (variant === 'icon') {
    return (
      <IconOnlyButton
        onClick={handleClick}
        aria-label={optimisticLiked ? '좋아요 취소' : '좋아요'}
      >
        <Heart
          size={18}
          fill={optimisticLiked ? theme.color.primary : 'none'}
          color={optimisticLiked ? theme.color.primary : theme.color.subText}
        />
      </IconOnlyButton>
    );
  }

  return (
    <BorderedButton
      $liked={optimisticLiked}
      onClick={handleClick}
      aria-label={optimisticLiked ? '좋아요 취소' : '좋아요'}
    >
      <Heart
        size={18}
        fill={optimisticLiked ? theme.color.primary : 'none'}
        color={optimisticLiked ? theme.color.primary : theme.color.subText}
      />
    </BorderedButton>
  );
};

const IconOnlyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BorderedButton = styled.button<{ $liked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 12px;
  background: transparent;
  border: 1px solid ${({ theme, $liked }) => $liked ? theme.color.primary : theme.color.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default LikeButton;
