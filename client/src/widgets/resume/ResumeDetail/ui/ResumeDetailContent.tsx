import { useEffect, useState } from 'react';
import { ResumeProfileSection } from 'entities/resume/ui/detailSections/ResumeProfileSection';
import { ResumeCareerSection } from 'entities/resume/ui/detailSections/ResumeCareerSection';
import { fetchMockResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from 'entities/resume/model/types/resume.type';
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

interface Props {
  resumeId: number;
}

export const ResumeDetailContent = ({ resumeId }: Props) => {
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchMockResume(resumeId)
      .then((data) => {
        setResume(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [resumeId]);

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 찾을 수 없습니다." />;

  return (
    <Main>
      <Article>
        {/* 1. 프로필 섹션 */}
        <ResumeProfileSection
          data={resume}
          actions={null /* 추후 회원정보 수정 버튼 슬롯 */}
        />

        {/* 2. 경력 섹션 */}
        <ResumeCareerSection data={resume} />
      </Article>
    </Main>
  );
};
