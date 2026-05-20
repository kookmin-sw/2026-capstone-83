import { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import styled from 'styled-components';

export type CardMenuItemTone = 'default' | 'primary' | 'danger';

export interface CardMenuItem {
  label: string;
  onClick: () => void;
  tone?: CardMenuItemTone;
  disabled?: boolean;
}

interface Props {
  items: CardMenuItem[];
  /** 메뉴 상단 안내 (클릭 불가) */
  notice?: string;
  ariaLabel?: string;
}

export const CardActionsMenu = ({ items, notice, ariaLabel = '작업 메뉴' }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (items.length === 0 && !notice) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleItemClick = (item: CardMenuItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.disabled) return;
    setOpen(false);
    item.onClick();
  };

  return (
    <S.Wrapper ref={ref} onClick={(e) => e.stopPropagation()}>
      <S.Trigger type="button" aria-label={ariaLabel} aria-expanded={open} onClick={handleToggle}>
        <MoreVertical size={18} />
      </S.Trigger>

      {open && (
        <S.Menu role="menu">
          {notice && <S.Notice>{notice}</S.Notice>}
          {items.map((item) => (
            <S.MenuItem
              key={item.label}
              type="button"
              role="menuitem"
              $tone={item.tone ?? 'default'}
              disabled={item.disabled}
              onClick={handleItemClick(item)}
            >
              {item.label}
            </S.MenuItem>
          ))}
        </S.Menu>
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    position: relative;
    flex-shrink: 0;
  `,
  Trigger: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.color.subBackground};
      color: ${({ theme }) => theme.color.text};
    }
  `,
  Menu: styled.div`
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 160px;
    background: ${({ theme }) => theme.color.white};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    padding: 6px 0;
    z-index: 50;
  `,
  Notice: styled.p`
    margin: 0;
    padding: 8px 14px 10px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.4;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  `,
  MenuItem: styled.button<{ $tone: CardMenuItemTone }>`
    width: 100%;
    padding: 10px 14px;
    text-align: left;
    font-size: ${({ theme }) => theme.fontSize.small};
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${({ theme, $tone }) =>
      $tone === 'danger' ? theme.color.error : $tone === 'primary' ? theme.color.primary : theme.color.text};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.color.subBackground};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
};
