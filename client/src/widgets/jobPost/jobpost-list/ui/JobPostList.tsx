
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import * as S from './JobPostList.styled';
import { useJobPostsInfinite } from 'entities/jobPost/model/hooks/useJobPostsInfinite';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

export const JobPostList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useJobPostsInfinite({});

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <Loading message="공고 불러오는 중..." />;
  if (status === 'error') return <Empty message="데이터를 불러오는 데 실패했습니다." />;

  return (
    <S.ListContainer>
      {data?.pages.map((page) =>
        page.contents.map((post) => (
          <JobPostCard
            key={post.id}
            data={post}
            extraActions={<LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="icon" />}
          />
        ))
      )}

      <S.ObserverTarget ref={ref}>
        {isFetchingNextPage && <Loading message="더 많은 공고 로딩 중..." />}
      </S.ObserverTarget>
    </S.ListContainer>
  );
};