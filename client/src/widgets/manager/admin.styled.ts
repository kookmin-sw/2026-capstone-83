import styled from 'styled-components';

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

export const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xlarge};
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
`;

export const PageDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.subText};
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
`;

export const FilterField = styled.div`
  min-width: 140px;
  flex: 1;
  max-width: 220px;
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSize.small};

  th,
  td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  }

  th {
    font-weight: 600;
    color: ${({ theme }) => theme.color.subText};
    background: ${({ theme }) => theme.color.background};
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: ${({ theme }) => theme.color.secondary};
    }
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

export const DetailGrid = styled.dl`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px 16px;
  margin: 0;

  dt {
    font-weight: 600;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  }

  dd {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
  }
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

export const MetricCard = styled.div`
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.color.background};
  border: 1px solid ${({ theme }) => theme.color.border};

  .label {
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    margin-bottom: 8px;
  }

  .value {
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 700;
    color: ${({ theme }) => theme.color.text};
  }

  .sub {
    margin-top: 4px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  }
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

export const EmptyMessage = styled.p`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.color.subText};
  font-size: ${({ theme }) => theme.fontSize.small};
`;

export const ClickableRow = styled.tr`
  cursor: pointer;
`;
