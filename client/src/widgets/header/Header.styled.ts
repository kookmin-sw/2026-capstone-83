import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  background-color: ${({ theme }) => theme.color.white};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HeaderInner = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 왼쪽: 로고 + 네비게이션
export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
`;

export const LogoImg = styled.img`
  height: 28px;
  width: auto;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
`;

export const NavLink = styled(Link) <{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
  color: ${({ theme, $active }) =>
    $active ? theme.color.primary : theme.color.text};
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

// 하위 호환용 (기존 NavItem 사용처가 있을 수 있음)
export const NavItem = styled.a<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
  color: ${({ theme, $active }) =>
    $active ? theme.color.primary : theme.color.text};
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

// 오른쪽: 액션 버튼들
export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const CreateLink = styled(Link)`
  text-decoration: none;
`;

// 드롭다운 공통 래퍼
export const DropdownWrapper = styled.div`
  position: relative;
`;

export const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.background};
  }
`;

export const NotiBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.color.error};
  color: ${({ theme }) => theme.color.white};
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadow.default};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 6px 0;
  z-index: 100;
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.text};
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.background};
  }
`;

export const DropdownDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  margin: 4px 0;
`;

export const EmptyMessage = styled.p`
  padding: 16px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
`;
