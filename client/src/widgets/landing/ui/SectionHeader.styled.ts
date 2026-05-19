import styled from 'styled-components';

export const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

export const Tag = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: ${({ theme }) => theme.color.secondary};
  color: ${({ theme }) => theme.color.primary};
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

export const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  margin: 0 0 12px;
  color: ${({ theme }) => theme.color.text};

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    font-size: 1.75rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.05rem;
  color: ${({ theme }) => theme.color.subText};
  margin: 0;
`;
