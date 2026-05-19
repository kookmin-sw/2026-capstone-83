import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';
import { LandingIntro } from 'widgets/landing/ui/LandingIntro';
import { useQuery } from '@tanstack/react-query';
import { fetchJobPosts } from 'entities/jobPost/api/jobPost.api';
import { filterActiveDeadlineJobPosts } from 'entities/jobPost/lib/filterActiveDeadlineJobPosts';
import { SECTION_SIZE } from 'entities/jobPost/model/constants';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import Loading from 'shared/ui/Loading/Loading';

const MainPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['jobPosts', 'recommended', SECTION_SIZE],
    queryFn: () => fetchJobPosts({ size: SECTION_SIZE, sortType: 'RECOMMENDED' }),
    staleTime: 1000 * 60 * 5,
  });

  const jobPosts = filterActiveDeadlineJobPosts(data?.contents || []);

  return (
    <S.Page>
      <LandingIntro />

      {/* 추천 공고 섹션 */}
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>추천 공고</S.SectionTitle>
          <S.MoreLink to="/jobposts">
            더보기 <ChevronRight size={16} />
          </S.MoreLink>
        </S.SectionHeader>

        {isLoading ? (
          <Loading message="추천 공고를 불러오는 중..." />
        ) : (
          <S.CardGrid>
            {jobPosts.map((post) => (
              <JobPostCard
                key={post.id}
                data={post}
                extraActions={<LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="icon" />}
              />
            ))}
          </S.CardGrid>
        )}
      </S.Section>
    </S.Page>
  );
};

const S = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Section: styled.section`
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 20px 40px;
    width: 100%;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  `,
  SectionTitle: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  MoreLink: styled(Link)`
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    text-decoration: none;

    &:hover {
      color: ${({ theme }) => theme.color.primary};

      svg {
        stroke: ${({ theme }) => theme.color.primary};
      }
    }
  `,
  CardGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: 1fr;
    }
  `,
};

export default MainPage;
