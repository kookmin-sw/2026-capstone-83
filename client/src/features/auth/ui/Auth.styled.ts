import styled from 'styled-components';

// 페이지 배경 + 중앙 정렬
export const AuthPageBackground = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.color.background};
  padding: 40px 20px;
`;

// 카드 컨테이너
export const AuthCard = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadow.default};
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    padding: 32px 20px;
  }
`;

// 로고 이미지
export const LogoImage = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 32px;
`;

// 역할 탭 컨테이너
export const RoleTabGroup = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.color.background};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 4px;
  margin-bottom: 28px;
`;

// 역할 탭 버튼
export const RoleTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 0;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
  color: ${({ theme, $active }) =>
    $active ? theme.color.white : theme.color.subText};
  background-color: ${({ theme, $active }) =>
    $active ? theme.color.tertiary : 'transparent'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
`;

// 폼
export const AuthForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// 폼 하단 링크 영역
export const AuthFooter = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
`;

export const AuthLink = styled.span`
  color: ${({ theme }) => theme.color.highlight};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
