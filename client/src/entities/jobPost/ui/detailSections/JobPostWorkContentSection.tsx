
import styled from 'styled-components'
import type { JobPostWorkContentProps } from '../../model/types/jobPost.type';
import Section from 'shared/ui/Layout/Section';


export const JobPostWorkContentSection = ({ data }: { data: JobPostWorkContentProps }) => {

  if (!data) {
    return <div>로딩 중...</div>; // 또는 null
  }

  const { requirements, tasks, benefits, items } = data;

  return (
    <Section title="근무 내용">
      <S.WorkGrid>
        <S.GridItem>
          <span className="label">지원 조건</span>
          <span className="value">{requirements?.join(', ') || '학력 무관'}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">업무 내용</span>
          <span className="value">{tasks.join(', ')}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">우대 조건</span>
          <span className="value">{benefits?.join(', ') || '-'}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">준비물</span>
          <span className="value">{items?.join(', ') || '-'}</span>
        </S.GridItem>
      </S.WorkGrid>
    </Section>
  );
};

const S = {
  WorkGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 24px 40px;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
  `,
  GridItem: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    .label { color: ${({ theme }) => theme.color.subText}; font-size: 14px; }
    .value { line-height: 1.5; color: ${({ theme }) => theme.color.text}; }
  `
};