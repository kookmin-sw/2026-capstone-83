import { useState, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  Shield,
  Users,
} from 'lucide-react';
import styled from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const MANAGER_NAV: NavItem[] = [
  { label: '대시보드', path: '/admin', icon: <BarChart3 size={20} /> },
  { label: '회원 관리', path: '/admin/users', icon: <Users size={20} /> },
  { label: '신고 관리', path: '/admin/reports', icon: <Flag size={20} /> },
];

const ManagerSidebar = () => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const expandSidebar = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(false);
  };

  return (
    <S.Sidebar $collapsed={isCollapsed}>
      {isCollapsed ? (
        <S.BrandIconWrap title="관리자">
          <S.Brand $collapsed>
            <Shield size={22} />
          </S.Brand>
          <S.ExpandToggle type="button" aria-label="사이드바 펼치기" onClick={expandSidebar}>
            <ChevronsRight size={18} />
          </S.ExpandToggle>
        </S.BrandIconWrap>
      ) : (
        <S.BrandRow>
          <S.Brand $collapsed={false}>
            <Shield size={22} />
            <span>관리자</span>
          </S.Brand>
          <S.CollapseToggle
            type="button"
            aria-label="사이드바 접기"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronsLeft size={18} />
          </S.CollapseToggle>
        </S.BrandRow>
      )}

      <S.NavList>
        {MANAGER_NAV.map(({ label, path, icon }) => (
          <S.NavLink
            key={path}
            to={path}
            $active={isActive(path)}
            $collapsed={isCollapsed}
            title={isCollapsed ? label : undefined}
          >
            <span className="icon">{icon}</span>
            {!isCollapsed && <span className="label">{label}</span>}
            {isCollapsed && <S.Tooltip>{label}</S.Tooltip>}
          </S.NavLink>
        ))}
      </S.NavList>
    </S.Sidebar>
  );
};

const S = {
  Sidebar: styled.aside<{ $collapsed: boolean }>`
    width: ${({ $collapsed }) => ($collapsed ? '72px' : '240px')};
    min-height: calc(100vh - 60px);
    height: calc(100vh - 60px);
    position: sticky;
    top: 60px;
    flex-shrink: 0;
    background: ${({ theme }) => theme.color.white};
    border-right: 1px solid ${({ theme }) => theme.color.border};
    padding: ${({ $collapsed }) => ($collapsed ? '24px 12px' : '24px 16px')};
    display: flex;
    flex-direction: column;
    gap: 32px;
    transition: width 0.2s ease;
    overflow-x: hidden;
    overflow-y: auto;
  `,
  BrandRow: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  `,
  BrandIconWrap: styled.div`
    position: relative;
    width: 36px;
    height: 36px;
    margin: 0 auto;

    & > div:first-child {
      width: 100%;
      height: 100%;
      padding: 0;
      justify-content: center;
    }

    &:hover > div:first-child,
    &:focus-within > div:first-child {
      visibility: hidden;
    }

    &:hover button,
    &:focus-within button {
      opacity: 1;
      pointer-events: auto;
    }
  `,
  Brand: styled.div<{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    padding: 8px ${({ $collapsed }) => ($collapsed ? '0' : '8px')};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.primary};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    white-space: nowrap;

    svg {
      flex-shrink: 0;
    }
  `,
  CollapseToggle: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
      color: ${({ theme }) => theme.color.text};
    }
  `,
  ExpandToggle: styled.button`
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.secondary};
    color: ${({ theme }) => theme.color.primary};
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease, background-color 0.15s ease;

    svg {
      color: ${({ theme }) => theme.color.primary};
      stroke: currentColor;
    }

    &:hover {
      background: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.white};

      svg {
        color: ${({ theme }) => theme.color.white};
      }
    }
  `,
  NavList: styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  `,
  NavLink: styled(Link)<{ $active: boolean; $collapsed: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.text)};
    background: ${({ theme, $active }) =>
      $active ? theme.color.secondary : 'transparent'};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme, $active }) =>
      $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
    text-decoration: none;
    width: 100%;
    white-space: nowrap;
    transition: all 0.15s ease;
    ${hoverOverlay}

    .icon {
      display: flex;
      flex-shrink: 0;
      color: ${({ theme, $active }) =>
        $active ? theme.color.primary : theme.color.subText};
    }

    .label {
      color: ${({ theme, $active }) =>
        $active ? theme.color.tertiary : theme.color.text};
    }

    &:hover > span:last-child {
      ${({ $collapsed }) => $collapsed && 'opacity: 1; visibility: visible;'}
    }
  `,
  Tooltip: styled.span`
    position: absolute;
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    padding: 6px 12px;
    background-color: ${({ theme }) => theme.color.text};
    color: ${({ theme }) => theme.color.white};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease;
    z-index: 100;
    pointer-events: none;
  `,
};

export default ManagerSidebar;
