import styled from 'styled-components';

export const Section = styled.section`
  background: ${({ theme }) => theme.color.background};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.article`
  padding: 36px 28px;
  background: ${({ theme }) => theme.color.background};
  border: 1px solid rgba(206, 206, 206, 0.4);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    border-color: ${({ theme }) => theme.color.primary};
  }
`;

export const IconWrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.color.secondary};
  color: ${({ theme }) => theme.color.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 20px;
`;

export const CardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  margin: 0 0 10px;
  color: ${({ theme }) => theme.color.text};
`;

export const CardDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.subText};
  line-height: 1.7;
  margin: 0;
`;
