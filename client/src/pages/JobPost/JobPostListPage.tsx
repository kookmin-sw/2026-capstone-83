// pages/JobPostPage.tsx
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';
import { useSearchParams } from 'react-router-dom';
import { JobPostInfiniteList } from 'widgets/jobPost/jobpost-list/ui/JobPostInfiniteList';


export const JobPostListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL에서 필요한 파라미터들만 객체로 추출[cite: 5]
  const filterParams: GetJobPostsParams = {
    keyword: searchParams.get('keyword') || undefined,
    location: searchParams.get('location') || undefined,
    sortType: (searchParams.get('sortType') as any) || 'WORK_DATE',
    // 페이지나 사이즈 정보도 필요하다면 여기서 추가
  };

  // 2. 필터 변경 시 URL의 쿼리 스트링을 업데이트하는 함수
  const handleFilterChange = (newParams: Partial<GetJobPostsParams>) => {
    // 기존의 모든 파라미터를 복사한 뒤 새로운 값으로 덮어씌움
    const updatedParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updatedParams.set(key, String(value));
      } else {
        updatedParams.delete(key); // 값이 없으면 쿼리에서 삭제
      }
    });

    setSearchParams(updatedParams); // URL이 업데이트되면서 컴포넌트가 리렌더링됨
  };

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