import styled from 'styled-components';

export const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 14px 18px;
  background: ${({ theme }) => theme.color.white};
  border: 1.5px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 4px 24px rgba(77, 177, 144, 0.15);
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.color.text};
  background: transparent;

  &::placeholder {
    color: ${({ theme }) => theme.color.subText};
  }
`;

export const SearchButton = styled.button`
  flex-shrink: 0;
  padding: 14px 26px;
  width: auto;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    width: 100%;
  }
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.color.white};
  background: ${({ theme }) => theme.color.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  box-shadow: 0 4px 20px rgba(77, 177, 144, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.color.tertiary};
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(77, 177, 144, 0.35);
  }
`;
