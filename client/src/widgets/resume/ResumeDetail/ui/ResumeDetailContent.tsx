import { ResumeProfileSection } from 'entities/resume/ui/detailSections/ResumeProfileSection';
import { ResumeCareerSection } from 'entities/resume/ui/detailSections/ResumeCareerSection';
import { useResumeDetail } from 'entities/resume/model/hooks/useResumeDetail';
import LikeResumeButton from 'features/like/LikeResumeButton';
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import StickyBar from 'shared/ui/StickyBar/StickyBar';

interface Props {
  resumeId: number;
}

export const ResumeDetailContent = ({ resumeId }: Props) => {
  const { data: resume, isLoading, isError } = useResumeDetail(resumeId);

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 찾을 수 없습니다." />;

  return (
    <Main>
      <Article>
        <ResumeProfileSection
          data={resume}
          actions={
            <LikeResumeButton resumeId={resumeId} liked={resume.liked} variant="bordered" />
          }
        />
        <ResumeCareerSection data={resume} />
      </Article>

      <StickyBar>
        <LikeResumeButton resumeId={resumeId} liked={resume.liked} variant="bordered" />
      </StickyBar>
    </Main>
  );
};
