import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Search, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchJobPosts } from 'entities/jobPost/api/jobPost.api';
import { SECTION_SIZE } from 'entities/jobPost/model/constants';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import Button from 'shared/ui/Button/Button';
import Loading from 'shared/ui/Loading/Loading';

const MainPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobPosts', 'recommended', SECTION_SIZE],
    queryFn: () => fetchJobPosts({ size: SECTION_SIZE, sortType: 'RECOMMENDED' }),
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = () => {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    navigate(`/jobposts${params}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const jobPosts = data?.contents || [];

  return (
    <S.Page>
      {/* 검색바 */}
      <S.SearchSection>
        <S.SearchRow>
          <S.SearchInputWrapper>
            <Search size={20} />
            <S.SearchInput
              type="text"
              placeholder="직종, 회사명, 지역으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </S.SearchInputWrapper>
          <Button scheme="primary" buttonSize="smallMedium" onClick={handleSearch}>
            검색
          </Button>
        </S.SearchRow>
      </S.SearchSection>

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
  SearchSection: styled.section`
    display: flex;
    justify-content: center;
    padding: 24px 20px;
  `,
  SearchRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 600px;
  `,
  SearchInputWrapper: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.white};

    &:focus-within {
      border-color: ${({ theme }) => theme.color.primary};
      box-shadow: 0 0 0 1px ${({ theme }) => theme.color.primary};
    }

    svg {
      color: ${({ theme }) => theme.color.subText};
      flex-shrink: 0;
    }
  `,
  SearchInput: styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.color.text};
    background: transparent;

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  Section: styled.section`
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px 40px;
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
