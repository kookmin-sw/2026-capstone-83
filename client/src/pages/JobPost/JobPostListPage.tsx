// pages/JobPostPage.tsx
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';
import { useSearchParams } from 'react-router-dom';
import { JobPostInfiniteList } from 'widgets/jobPost/jobpost-list/ui/JobPostInfiniteList';


export const JobPostListPage = () => {
  const [searchParams] = useSearchParams();

  // 1. URL에서 필요한 파라미터들만 객체로 추출[cite: 5]
  const filterParams: GetJobPostsParams = {
    keyword: searchParams.get('keyword') || undefined,
    location: searchParams.get('location') || undefined,
    sortType: (searchParams.get('sortType') as GetJobPostsParams['sortType']) || 'WORK_DATE',
    // 페이지나 사이즈 정보도 필요하다면 여기서 추가
  };

  // TODO: 필터 UI 구현 시 활성화
  // const handleFilterChange = (newParams: Partial<GetJobPostsParams>) => {
  //   const updatedParams = new URLSearchParams(searchParams);
  //   Object.entries(newParams).forEach(([key, value]) => {
  //     if (value) {
  //       updatedParams.set(key, String(value));
  //     } else {
  //       updatedParams.delete(key);
  //     }
  //   });
  //   setSearchParams(updatedParams);
  // };

  return (
    <main>
      {/* 현재 필터 상태를 UI에 표시하고 변경 이벤트를 처리 */}
      {/* <JobPostFilterBar
        activeFilters={filterParams}
        onFilterChange={handleFilterChange}
      /> */}

      {/* 업데이트된 filterParams를 리스트 위젯에 주입 */}
      <JobPostInfiniteList filterParams={filterParams} />
    </main>
  );
};
