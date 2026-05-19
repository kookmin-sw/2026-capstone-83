import styled, { keyframes } from 'styled-components';
import { gradientText } from './landing.styled';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.02);
  }
`;

export const Hero = styled.section`
  position: relative;
  min-height: min(85vh, 720px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px 64px;
  overflow: hidden;
  background: ${({ theme }) => theme.color.background};
`;

export const BgShapes = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

export const Shape = styled.div<{ $variant: 1 | 2 | 3 }>`
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: ${float} 8s ease-in-out infinite;

  ${({ $variant, theme }) =>
    $variant === 1 &&
    `
    width: 500px;
    height: 500px;
    background: ${theme.color.primary};
    top: -100px;
    right: -150px;
    animation-delay: 0s;
  `}

  ${({ $variant, theme }) =>
    $variant === 2 &&
    `
    width: 350px;
    height: 350px;
    background: ${theme.color.highlight};
    bottom: -50px;
    left: -100px;
    animation-delay: 2s;
  `}

  ${({ $variant, theme }) =>
    $variant === 3 &&
    `
    width: 200px;
    height: 200px;
    background: ${theme.color.accent};
    top: 40%;
    left: 10%;
    animation-delay: 4s;
  `}
`;

export const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 640px;
`;

export const Badge = styled.div`
  display: inline-block;
  padding: 8px 20px;
  background: ${({ theme }) => theme.color.secondary};
  color: ${({ theme }) => theme.color.tertiary};
  font-size: 0.85rem;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.6s ease;
`;

export const Title = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 24px;
  color: ${({ theme }) => theme.color.text};
  animation: ${fadeInUp} 0.6s ease 0.1s both;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    font-size: 2.2rem;
  }
`;

export const GradientSpan = styled.span`
  ${gradientText}
`;

export const Description = styled.p`
  font-size: 1.15rem;
  color: ${({ theme }) => theme.color.subText};
  max-width: 520px;
  margin: 0 auto 40px;
  line-height: 1.8;
  animation: ${fadeInUp} 0.6s ease 0.2s both;

  strong {
    color: ${({ theme }) => theme.color.text};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    font-size: 1rem;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  animation: ${fadeInUp} 0.6s ease 0.3s both;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

export const ScrollLink = styled.div`
  margin-top: 24px;
  animation: ${fadeInUp} 0.6s ease 0.4s both;
`;

export const GithubIcon = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  background-color: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E")
    center / contain no-repeat;
`;
