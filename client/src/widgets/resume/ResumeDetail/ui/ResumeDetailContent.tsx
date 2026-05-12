import { useEffect, useState } from 'react';
import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import { fetchMockResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from 'entities/resume/model/types/resume.type';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

interface Props {
  resumeId: number;
}

/**
 * 이력서 상세 페이지 위젯 (id 기반 조회)
 * 고용주가 지원자의 이력서를 조회할 때 사용합니다.
 */
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
      <ResumeDetailView data={resume} />
    </Main>
  );
};
