import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';
import { useSearchParams } from 'react-router-dom';
import { JobPostInfiniteList } from 'widgets/jobPost/jobpost-list/ui/JobPostInfiniteList';
import { JobPostFilterBar } from 'widgets/jobPost/jobPostFilter/ui/JobPostFilterBar';
import type { TimeTag } from 'entities/jobPost/model/types/jobPost.type';
import type { CertificateType } from 'shared/types/certificate';

export const JobPostListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 필터 파라미터 추출
  const filterParams: GetJobPostsParams = {
    keyword: searchParams.get('keyword') || undefined,
    location: searchParams.get('location') || undefined,
    sortType: (searchParams.get('sortType') as GetJobPostsParams['sortType']) || 'RECOMMENDED',
    minWage: searchParams.get('minWage') ? Number(searchParams.get('minWage')) : undefined,
    wageType: (searchParams.get('wageType') as GetJobPostsParams['wageType']) || undefined,
    timeTags: searchParams.getAll('timeTags').length > 0
      ? searchParams.getAll('timeTags') as TimeTag[]
      : undefined,
    certRequirements: searchParams.getAll('certRequirements').length > 0
      ? searchParams.getAll('certRequirements') as CertificateType[]
      : undefined,
  };

  const handleFilterChange = (newParams: Partial<GetJobPostsParams>) => {
    const updatedParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      updatedParams.delete(key);
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => updatedParams.append(key, String(v)));
        } else {
          updatedParams.set(key, String(value));
        }
      }
    });

    setSearchParams(updatedParams);
  };

  return (
    <main>
      <JobPostFilterBar
        activeFilters={filterParams}
        onFilterChange={handleFilterChange}
      />
      <JobPostInfiniteList filterParams={filterParams} />
    </main>
  );
};
