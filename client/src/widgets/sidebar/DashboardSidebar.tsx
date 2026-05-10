import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, CalendarDays, Users, Settings, FileText, UserRoundPlus, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import styled from 'styled-components';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const EMPLOYER_NAV: NavItem[] = [
  { label: '대시보드', path: '/dashboard', icon: <Home size={20} /> },
  { label: '작업장 관리', path: '/dashboard/workplace', icon: <Building2 size={20} /> },
  { label: '캘린더', path: '/dashboard/calendar', icon: <CalendarDays size={20} /> },
  { label: '인재풀', path: '/dashboard/workers', icon: <Users size={20} /> },
  { label: '설정', path: '/dashboard/settings', icon: <Settings size={20} /> },
];

const APPLICANT_NAV: NavItem[] = [
  { label: '대시보드', path: '/dashboard', icon: <Home size={20} /> },
  { label: '이력서 관리', path: '/dashboard/resume', icon: <FileText size={20} /> },
  { label: '캘린더', path: '/dashboard/calendar', icon: <CalendarDays size={20} /> },
  { label: '지원 이력', path: '/dashboard/applications', icon: <UserRoundPlus size={20} /> },
  { label: '설정', path: '/dashboard/settings', icon: <Settings size={20} /> },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = useAuthStore((s) => s.role);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = role === 'EMPLOYER' ? EMPLOYER_NAV : APPLICANT_NAV;

  return (
    <S.Sidebar $collapsed={isCollapsed}>
      {/* 프로필 영역 */}
      <S.ProfileArea $collapsed={isCollapsed}>
        <S.Avatar>
          <img
            src="https://api.dicebear.com/7.x/identicon/svg?seed=user"
            alt="프로필"
          />
        </S.Avatar>
        {!isCollapsed && (
          <S.ProfileName>
            {role === 'EMPLOYER' ? '(주) 미래건설' : '김철수'}
          </S.ProfileName>
        )}
      </S.ProfileArea>

      {/* 네비게이션 */}
      <S.NavList>
        {navItems.map(({ label, path, icon }) => (
          <S.NavItem
            key={path}
            $active={pathname === path}
            $collapsed={isCollapsed}
            onClick={() => navigate(path)}
            title={isCollapsed ? label : undefined}
          >
            <span className="icon">{icon}</span>
            {!isCollapsed && <span className="label">{label}</span>}
            {isCollapsed && <S.Tooltip>{label}</S.Tooltip>}
          </S.NavItem>
        ))}
      </S.NavList>

      {/* 접기/펴기 토글 */}
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
    min-height: calc(100vh - 60px);
    background-color: ${({ theme }) => theme.color.white};
    border-right: 1px solid ${({ theme }) => theme.color.border};
    padding: ${({ $collapsed }) => ($collapsed ? '24px 12px' : '24px 16px')};
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex-shrink: 0;
    transition: width 0.2s ease;
    overflow: hidden;
  `,
  ProfileArea: styled.div<{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 ${({ $collapsed }) => ($collapsed ? '0' : '8px')};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  `,
  Avatar: styled.div`
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  ProfileName: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
  `,
  NavList: styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  `,
  NavItem: styled.button<{ $active: boolean; $collapsed: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: none;
    background-color: ${({ theme, $active }) =>
      $active ? theme.color.secondary : 'transparent'};
    color: ${({ theme, $active }) =>
      $active ? theme.color.primary : theme.color.text};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme, $active }) =>
      $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
    white-space: nowrap;

    .icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      color: ${({ theme, $active }) =>
      $active ? theme.color.primary : theme.color.subText};
    }

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
    }

    /* 접힌 상태에서 호버 시 툴팁 표시 */
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
  ToggleButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    cursor: pointer;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    transition: all 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
      color: ${({ theme }) => theme.color.text};
    }
  `,
};

export default DashboardSidebar;
