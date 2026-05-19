import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const FooterWrapper = styled.footer`
  width: 100%;
  padding: 48px 24px;
  background-color: ${({ theme }) => theme.color.secondary};
  color: ${({ theme }) => theme.color.text};

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 40px 20px;
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    padding: 32px 16px;
  }
`;

export const FooterInner = styled.div`
  width: 100%;
  max-width: 1280px;
  min-width: 280px;
  margin: 0 auto;
`;

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LogoImg = styled.img`
  height: 32px;
  width: auto;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    height: 28px;
  }
`;

export const FooterText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.subText};
  line-height: 1.5;
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const FooterLink = styled.a`
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.thirdText};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;
