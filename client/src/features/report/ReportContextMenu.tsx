import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Flag } from 'lucide-react';

interface Props {
  /** 카드 기준 우상단 근처에 메뉴를 붙입니다 (우클릭 좌표 대신). */
  anchorRect: DOMRect;
  onClose: () => void;
  onReport: () => void;
}

const MENU_MIN_WIDTH = 160;
const EST_MENU_HEIGHT = 52;
const VIEW_MARGIN = 8;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function menuPosition(anchorRect: DOMRect) {
  let left = anchorRect.right - MENU_MIN_WIDTH;
  left = clamp(left, VIEW_MARGIN, window.innerWidth - MENU_MIN_WIDTH - VIEW_MARGIN);
  let top = anchorRect.top + VIEW_MARGIN;
  top = clamp(top, VIEW_MARGIN, window.innerHeight - EST_MENU_HEIGHT - VIEW_MARGIN);
  return { left, top };
}

/**
 * 카드 우상단 근처에 붙는 컨텍스트 메뉴.
 * document 캡처 리스너는 메뉴 내부 포인터 이벤트는 무시해, 항목 클릭 시 onReport가 실행되도록 합니다.
 */
const ReportContextMenu = ({ anchorRect, onClose, onReport }: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { left, top } = menuPosition(anchorRect);

  useEffect(() => {
    const handlePointer = (e: PointerEvent | MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };

    const handleScroll = () => onClose();

    const t = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointer, true);
      document.addEventListener('contextmenu', handlePointer, true);
      document.addEventListener('scroll', handleScroll, true);
    }, 10);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('pointerdown', handlePointer, true);
      document.removeEventListener('contextmenu', handlePointer, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <S.Menu ref={menuRef} role="menu" style={{ left, top }}>
      <S.Item
        type="button"
        role="menuitem"
        onClick={(e) => {
          e.stopPropagation();
          onReport();
          onClose();
        }}
      >
        <Flag size={16} aria-hidden />
        신고하기
      </S.Item>
    </S.Menu>,
    document.body,
  );
};

const S = {
  Menu: styled.div`
    position: fixed;
    z-index: 10050;
    min-width: ${MENU_MIN_WIDTH}px;
    padding: 6px 0;
    background: ${({ theme }) => theme.color.white};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  Item: styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    border: none;
    background: transparent;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    cursor: pointer;
    text-align: left;

    &:hover {
      background: ${({ theme }) => theme.color.secondary};
    }
  `,
};

export default ReportContextMenu;
