import { useState, type MouseEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Building2, CalendarDays, Users, Settings, FileText, UserRoundPlus, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import {
  getProfileAvatarUrl,
  useUserProfileStore,
} from 'entities/user/model/store/userProfileStore';
import styled from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const EMPLOYER_NAV: NavItem[] = [
  { label: '대시보드', path: '/dashboard', icon: <Home size={20} /> },
  { label: '작업장 관리', path: '/dashboard/workplace', icon: <Building2 size={20} /> },
  { label: '캘린더', path: '/dashboard/calendar', icon: <CalendarDays size={20} /> },
  { label: '인재풀', path: '/dashboard/talent', icon: <Users size={20} /> },
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
  const { pathname } = useLocation();
  const role = useAuthStore((s) => s.role);
  const profile = useUserProfileStore((s) => s.profile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayName = profile?.name ?? (role === 'EMPLOYER' ? '고용주' : '구직자');
  const avatarUrl = getProfileAvatarUrl(profile);

  const navItems = role === 'EMPLOYER' ? EMPLOYER_NAV : APPLICANT_NAV;

  const expandSidebar = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(false);
  };

  return (
    <S.Sidebar $collapsed={isCollapsed}>
      {/* 프로필 + 접기/펼치기 */}
      {isCollapsed ? (
        <S.ProfileAvatarWrap title={displayName}>
          <S.ProfileArea
            as={Link}
            to="/dashboard/settings"
            $collapsed
            aria-label={`${displayName} 설정`}
          >
            <S.Avatar>
              <img src={avatarUrl} alt={`${displayName} 프로필`} />
            </S.Avatar>
          </S.ProfileArea>
          <S.ExpandToggle type="button" aria-label="사이드바 펼치기" onClick={expandSidebar}>
            <ChevronsRight size={18} />
          </S.ExpandToggle>
        </S.ProfileAvatarWrap>
      ) : (
        <S.ProfileRow>
          <S.ProfileArea
            as={Link}
            to="/dashboard/settings"
            $collapsed={false}
            aria-label={`${displayName} 설정`}
          >
            <S.Avatar>
              <img src={avatarUrl} alt={`${displayName} 프로필`} />
            </S.Avatar>
            <S.ProfileName>{displayName}</S.ProfileName>
          </S.ProfileArea>
          <S.CollapseToggle
            type="button"
            aria-label="사이드바 접기"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronsLeft size={18} />
          </S.CollapseToggle>
        </S.ProfileRow>
      )}

      {/* 네비게이션 */}
      <S.NavList>
        {navItems.map(({ label, path, icon }) => (
          <S.NavLink
            key={path}
            to={path}
            $active={pathname === path}
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
    background-color: ${({ theme }) => theme.color.white};
    border-right: 1px solid ${({ theme }) => theme.color.border};
    padding: ${({ $collapsed }) => ($collapsed ? '24px 12px' : '24px 16px')};
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex-shrink: 0;
    transition: width 0.2s ease;
    overflow-x: hidden;
    overflow-y: auto;
  `,
  ProfileRow: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  `,
  ProfileAvatarWrap: styled.div`
    position: relative;
    width: 36px;
    height: 36px;
    margin: 0 auto;

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0;
    }

    &:hover a,
    &:focus-within a {
      visibility: hidden;
    }

    &:hover button,
    &:focus-within button {
      opacity: 1;
      pointer-events: auto;
    }
  `,
  ProfileArea: styled(Link) <{ $collapsed: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    padding: 8px ${({ $collapsed }) => ($collapsed ? '0' : '8px')};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    text-decoration: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
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
      /* background: ${({ theme }) => theme.color.primary}; */
      color: ${({ theme }) => theme.color.white};

      svg {
        color: ${({ theme }) => theme.color.white};
      }
    }
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
  NavLink: styled(Link) <{ $active: boolean; $collapsed: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
    justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    text-decoration: none;
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

    .label {
      color: ${({ theme, $active }) =>
      $active ? theme.color.tertiary : theme.color.text};
    }

    ${hoverOverlay}

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
};

export default DashboardSidebar;
