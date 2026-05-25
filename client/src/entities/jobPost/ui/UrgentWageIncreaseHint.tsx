import styled from 'styled-components';
import { formatUrgentWageIncrease, hasUrgentWageIncrease } from '../lib/urgentJobPost';

interface Props {
  urgentEnabled?: boolean | null;
  urgentWageIncrease?: number | null;
}

/** 급여 옆 급구 인상액 — 빨간색 (+N원) */
export const UrgentWageIncreaseHint = ({ urgentEnabled, urgentWageIncrease }: Props) => {
  if (!hasUrgentWageIncrease(urgentEnabled, urgentWageIncrease)) return null;

  return <Hint>{formatUrgentWageIncrease(urgentWageIncrease)}</Hint>;
};

const Hint = styled.span`
  margin-left: 4px;
  color: ${({ theme }) => theme.color.error};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;
