


import { fetchMockJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostDetail } from 'entities/jobPost/model/types/jobPost.type';
import { JobPostDescriptionSection } from 'entities/jobPost/ui/detailSections/JobPostDescriptionSection';
import { JobPostDetailOverviewSection } from 'entities/jobPost/ui/detailSections/JobPostDetailOverviewSection';
import { JobPostLocationSection } from 'entities/jobPost/ui/detailSections/JobPostLocationSection';
import { JobPostWorkContentSection } from 'entities/jobPost/ui/detailSections/JobPostWorkContentSection';
import { useEffect, useState } from 'react';
//import { ApplyButton, LikeButton } from 'features/jobApply'; // 지원 관련 기능
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';


interface Props {
  postId: number;
}


export const JobPostDetailContent = ({ postId }: Props) => {

  const [detailData, setDetailData] = useState<JobPostDetail | null>(null);


  useEffect(() => {
    fetchMockJobPost(Number(postId)).then((data) => {
      console.log('Fetched job post detail:', data);
      setDetailData(data);
    });
  }, [postId]);

  const { location } = detailData || {};

  return (
    <Main>
      <Article>
        {/* 1. 상단 개요 섹션 (비즈니스 로직인 버튼 포함) */}
        <JobPostDetailOverviewSection
          data={detailData}
        //actions={<><LikeButton id={detailData.id} /><ApplyButton id={detailData.id} /></>}
        />

        {/* 2. 근무 내용 섹션 */}
        <JobPostWorkContentSection data={detailData} />

        {/* 3. 근무지 섹션 (지도 포함) */}
        <JobPostLocationSection address={location} />


        {/* 4. 상세 정보 섹션 */}
        <JobPostDescriptionSection data={detailData} />
      </Article>
    </Main>
  );
};