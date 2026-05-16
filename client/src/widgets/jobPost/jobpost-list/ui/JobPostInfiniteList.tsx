// widgets/jobPost/ui/JobPostList.tsx
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import * as S from './JobPostList.styled';
import { useJobPostsInfinite } from 'entities/jobPost/model/hooks/useJobPostsInfinite';
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

export const JobPostInfiniteList = ({ filterParams }: { filterParams: GetJobPostsParams }) => {
  // 1. 무한 스크롤 훅 호출
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useJobPostsInfinite(filterParams);

  // 2. 하단 센서 관찰 (Intersection Observer)[cite: 6]
  const { ref, inView } = useInView();

  useEffect(() => {
    // 센서가 보이고, 다음 페이지가 있으며, 현재 로딩 중이 아닐 때 실행
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <Loading message="공고 불러오는 중..." />;
  if (status === 'error') return <Empty message="데이터를 불러오는 데 실패했습니다." />;

  return (
    <S.ListContainer>
      {/* 3. 2차원 배열(pages)을 1차원으로 펼쳐서 렌더링 */}
      {data?.pages.map((page) =>
        page.contents.map((post) => (
          <JobPostCard
            key={post.id}
            data={post}
            extraActions={<LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="icon" />}
          />
        ))
      )}

      {/* 4. 리스트 끝 관찰용 타겟 */}
      <S.ObserverTarget ref={ref}>
        {isFetchingNextPage && <Loading message="더 많은 공고 로딩 중..." />}
      </S.ObserverTarget>
    </S.ListContainer>
  );
};