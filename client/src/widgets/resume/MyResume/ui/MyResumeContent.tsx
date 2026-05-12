import { useMyResume } from 'entities/resume/model/hooks/useMyResume';
import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

/**
 * 대시보드 내 이력서 위젯
 * 로그인한 사용자의 이력서를 조회하여 표시합니다.
 */
export const MyResumeContent = () => {
  const { data: resume, isLoading, isError } = useMyResume();

  if (isLoading) return <Loading message="내 이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="등록된 이력서가 없습니다." />;

  return (
    <Main>
      <ResumeDetailView
        data={resume}
        actions={null /* 추후 이력서 수정 버튼 슬롯 */}
      />
    </Main>
  );
};
