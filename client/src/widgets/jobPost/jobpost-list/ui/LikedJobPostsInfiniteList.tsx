import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import { useLikedJobPostsInfinite } from 'entities/jobPost/model/hooks/useLikedJobPostsInfinite';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import * as S from './JobPostList.styled';

export const LikedJobPostsInfiniteList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useLikedJobPostsInfinite();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <Loading message="찜한 공고 불러오는 중..." />;
  if (status === 'error') return <Empty message="찜한 공고를 불러오는 데 실패했습니다." />;

  const visiblePosts = data?.pages.flatMap((page) => page.contents) ?? [];

  if (visiblePosts.length === 0 && !hasNextPage) {
    return <Empty message="찜한 공고가 없습니다." />;
  }

  return (
    <S.ListContainer>
      {data?.pages.map((page) =>
        page.contents.map((post) => (
          <JobPostCard
            key={post.id}
            data={post}
            extraActions={
              <LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="icon" />
            }
          />
        ))
      )}

      <S.ObserverTarget ref={ref}>
        {isFetchingNextPage && <Loading message="더 불러오는 중..." />}
      </S.ObserverTarget>
    </S.ListContainer>
  );
};
