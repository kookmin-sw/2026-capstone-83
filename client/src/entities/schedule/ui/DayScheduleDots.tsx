import styled from 'styled-components';
import type { Schedule } from '../model/types/schedule.type';

interface Props {
  schedules: Schedule[];
  max?: number;
}

/** 월간 캘린더 모바일 셀용 — 공고 건수를 점으로 표시 */
export const DayScheduleDots = ({ schedules, max = 3 }: Props) => {
  const visible = schedules.slice(0, max);
  const rest = schedules.length - visible.length;

  return (
    <S.Wrap aria-hidden>
      {visible.map((s) => (
        <S.Dot key={s.jobPostId} $closed={s.postStatus === 'CLOSED'} />
      ))}
      {rest > 0 && <S.More>+{rest}</S.More>}
    </S.Wrap>
  );
};

const S = {
  Wrap: styled.div`
    display: none;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: auto;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: flex;
    }
  `,
  Dot: styled.span<{ $closed: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: ${({ theme, $closed }) =>
      $closed ? theme.color.thirdBackground : theme.color.primary};
  `,
  More: styled.span`
    font-size: 10px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1;
  `,
};
