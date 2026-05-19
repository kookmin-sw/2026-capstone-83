import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import { dummyJobPost, dummyJobPostNoLogo } from 'entities/jobPost/ui/dummy';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import styled from 'styled-components';

/** JobPostCard 로고 유·무 레이아웃 비교 (/test) */
export const JobPostCardCompare = () => (
  <CompareSection>
    <CompareHeading>JobPostCard 레이아웃 비교</CompareHeading>
    <CompareDesc>같은 공고 데이터 기준 · 왼쪽: 로고 없음 / 오른쪽: 로고 있음</CompareDesc>

    <CompareGrid>
      <CompareColumn>
        <VariantLabel>로고 없음 (showLogo=false)</VariantLabel>
        <JobPostCard
          data={dummyJobPostNoLogo}
          showLogo={false}
          extraActions={<LikeJobPostButton jobPostId={dummyJobPostNoLogo.id} liked={false} variant="icon" />}
        />
      </CompareColumn>

      <CompareColumn>
        <VariantLabel>로고 있음 (showLogo=true)</VariantLabel>
        <JobPostCard
          data={dummyJobPost}
          showLogo
          extraActions={<LikeJobPostButton jobPostId={dummyJobPost.id} liked={false} variant="icon" />}
        />
      </CompareColumn>
    </CompareGrid>

    <CompareSubGrid>
      <CompareColumn>
        <VariantLabel>로고 슬롯 ON · 이미지 URL 없음 (이니셜)</VariantLabel>
        <JobPostCard
          data={dummyJobPostNoLogo}
          showLogo
          extraActions={
            <LikeJobPostButton jobPostId={dummyJobPostNoLogo.id} liked={false} variant="icon" />
          }
        />
      </CompareColumn>
    </CompareSubGrid>
  </CompareSection>
);

const CompareSection = styled.section`
  margin: 48px 0;
  padding: 32px 24px;
  background: ${({ theme }) => theme.color.background};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px dashed ${({ theme }) => theme.color.border};
`;

const CompareHeading = styled.h2`
  margin: 0 0 8px;
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

const CompareDesc = styled.p`
  margin: 0 0 24px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.subText};
`;

const CompareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    grid-template-columns: 1fr;
  }
`;

const CompareSubGrid = styled(CompareGrid)`
  margin-top: 24px;
  grid-template-columns: minmax(0, 1fr);
  max-width: 420px;
`;

const CompareColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VariantLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.color.primary};
`;
