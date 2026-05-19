import styled, { css } from 'styled-components';

/** Lucide 아이콘 — 부모 color 변경 시(hover 등) stroke 동기화 */
export const lucideIconCss = css`
  & > svg {
    flex-shrink: 0;
  }
`;

/** MainLayout Container 패딩을 벗어나 전체 너비 섹션 */
export const FullBleed = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
`;

export const LandingContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
`;

export const LandingSection = styled.section`
  padding: 100px 0;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 70px 0;
  }
`;

export const gradientText = css`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.color.primary} 0%,
    ${({ theme }) => theme.color.highlight} 50%,
    ${({ theme }) => theme.color.tertiary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme }) => theme.color.primary};
  color: ${({ theme }) => theme.color.white};
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(77, 177, 144, 0.3);
  transition: all 0.25s ease;
  border: none;
  cursor: pointer;

  ${lucideIconCss}

  &:hover {
    background: ${({ theme }) => theme.color.tertiary};
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(77, 177, 144, 0.4);
  }
`;

export const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.text};
  text-decoration: none;
  border: 1.5px solid ${({ theme }) => theme.color.border};
  transition: all 0.25s ease;
  cursor: pointer;

  ${lucideIconCss}

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.primary};
    transform: translateY(-2px);
  }
`;

export const TextButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.color.subText};
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
    transform: translateY(-2px);
  }
`;
