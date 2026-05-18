import { useState } from 'react';
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

  return (
    <S.Sidebar $collapsed={isCollapsed}>
      <S.Brand $collapsed={isCollapsed}>
        <Shield size={22} />
        {!isCollapsed && <span>관리자</span>}
      </S.Brand>

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
          </S.NavLink>
        ))}
      </S.NavList>

      <S.ToggleButton onClick={() => setIsCollapsed((prev) => !prev)}>
        {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        {!isCollapsed && <span>접기</span>}
      </S.ToggleButton>
    </S.Sidebar>
  );
};

const S = {
  Sidebar: styled.aside<{ $collapsed: boolean }>`
    width: ${({ $collapsed }) => ($collapsed ? '72px' : '240px')};
    flex-shrink: 0;
    background: ${({ theme }) => theme.color.white};
    border-right: 1px solid ${({ theme }) => theme.color.border};
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease;
    min-height: calc(100vh - 60px);
  `,
  Brand: styled.div<{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: ${({ $collapsed }) => ($collapsed ? '24px 16px' : '24px 20px')};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 700;
    color: ${({ theme }) => theme.color.primary};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  `,
  NavList: styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    flex: 1;
  `,
  NavLink: styled(Link)<{ $active: boolean; $collapsed: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: ${({ $collapsed }) => ($collapsed ? '12px' : '12px 16px')};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.text)};
    background: ${({ theme, $active }) =>
      $active ? theme.color.secondary : 'transparent'};
    font-weight: ${({ $active }) => ($active ? 600 : 500)};
    text-decoration: none;
    position: relative;
    ${hoverOverlay}

    .icon {
      display: flex;
      flex-shrink: 0;
    }
  `,
  ToggleButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 12px;
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.small};
    ${hoverOverlay}
  `,
};

export default ManagerSidebar;
