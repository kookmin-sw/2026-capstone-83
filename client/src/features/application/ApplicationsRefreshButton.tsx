import { RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { useApplications } from 'entities/application/model/hooks/useApplications';

export const ApplicationsRefreshButton = () => {
  const { refetch, isFetching } = useApplications();

  return (
    <S.Button type="button" onClick={() => refetch()} disabled={isFetching}>
      <RefreshCw size={14} />
      {isFetching ? '불러오는 중…' : '새로고침'}
    </S.Button>
  );
};

const S = {
  Button: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: ${({ theme }) => theme.fontSize.small};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background: ${({ theme }) => theme.color.white};
    cursor: pointer;
    color: ${({ theme }) => theme.color.text};
    flex-shrink: 0;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
};
