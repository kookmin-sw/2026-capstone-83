import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import { useResume } from 'entities/resume/model/hooks/useResume';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

/**
 * 이력서 상세 페이지 위젯
 * 본인 이력서를 조회할 때 사용합니다.
 */
export const ResumeDetailContent = () => {
  const { data: resume, isLoading, isError } = useResume();

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 찾을 수 없습니다." />;

  return (
    <Main>
      <ResumeDetailView data={resume} />
    </Main>
  );
};
