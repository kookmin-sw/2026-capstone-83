import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styled from 'styled-components';
import type { Workplace } from 'entities/workplace/model/types/workplace.type';
import Button from 'shared/ui/Button/Button';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  workplaces: Workplace[];
  selectedId: number | null; // null = 전체
  onSelect: (id: number | null) => void;
  onCreateClick: () => void;
  showAll?: boolean; // "전체" 탭 표시 여부 (기본 true)
}

export const WorkplaceFilterBar = ({ workplaces, selectedId, onSelect, onCreateClick, showAll = true }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <S.BarWrapper>
      <S.ScrollButton onClick={() => scrollBy('left')} aria-label="왼쪽 스크롤">
        <ChevronLeft size={18} />
      </S.ScrollButton>

      <S.TabList ref={scrollRef}>
        {showAll && (
          <S.Tab
            $active={selectedId === null}
            onClick={() => onSelect(null)}
          >
            전체
          </S.Tab>
        )}
        {workplaces.map((wp) => (
          <S.Tab
            key={wp.id}
            $active={selectedId === wp.id}
            onClick={() => onSelect(wp.id)}
          >
            {wp.name}
          </S.Tab>
        ))}
      </S.TabList>

      <S.ScrollButton onClick={() => scrollBy('right')} aria-label="오른쪽 스크롤">
        <ChevronRight size={18} />
      </S.ScrollButton>

      <S.CreateButton>
        <Button
          scheme="primary"
          buttonSize="small"
          fontSize="xsmall"
          borderRadius="medium"
          onClick={onCreateClick}
        >
          + 작업장 추가
        </Button>
      </S.CreateButton>
    </S.BarWrapper>
  );
};

const S = {
  BarWrapper: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  ScrollButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    cursor: pointer;
    border-radius: 50%;
    flex-shrink: 0;

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
    }
  `,
  TabList: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: hidden;
    flex: 1;
    scroll-behavior: smooth;
  `,
  Tab: styled.button<{ $active: boolean }>`
    padding: 8px 16px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    border: ${({ theme, $active }) =>
      $active ? 'none' : `1px solid ${theme.color.border}`};
    background-color: ${({ theme, $active }) =>
      $active ? theme.color.primary : 'transparent'};
    color: ${({ theme, $active }) =>
      $active ? theme.color.white : theme.color.text};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme, $active }) =>
      $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.15s ease;

    ${hoverOverlay}
  `,
  CreateButton: styled.div`
    margin-left: auto;
    flex-shrink: 0;
  `,
};
