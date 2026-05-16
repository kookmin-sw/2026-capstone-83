import { useEffect, useState } from 'react';
import { ResumeProfileSection } from 'entities/resume/ui/detailSections/ResumeProfileSection';
import { ResumeCareerSection } from 'entities/resume/ui/detailSections/ResumeCareerSection';
import { fetchResume, fetchMockResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from 'entities/resume/model/types/resume.type';
import LikeResumeButton from 'features/like/LikeResumeButton';
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import StickyBar from 'shared/ui/StickyBar/StickyBar';
import { USE_MOCK } from 'shared/config/env';

interface Props {
  resumeId: number;
}

export const ResumeDetailContent = ({ resumeId }: Props) => {
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const load = async () => {
      const real = await fetchResume().catch(() => null);
      if (real) {
        setResume(real);
        setIsLoading(false);
        return;
      }
      if (USE_MOCK) {
        fetchMockResume(resumeId)
          .then((data) => { setResume(data); setIsLoading(false); })
          .catch(() => { setIsError(true); setIsLoading(false); });
      } else {
        setIsError(true);
        setIsLoading(false);
      }
    };
    load();
  }, [resumeId]);

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 찾을 수 없습니다." />;

  return (
    <Main>
      <Article>
        <ResumeProfileSection
          data={resume}
          actions={<LikeResumeButton resumeId={resume.id} liked={resume.liked} variant="bordered" />}
        />
        <ResumeCareerSection data={resume} />
      </Article>

      <StickyBar>
        <LikeResumeButton resumeId={resume.id} liked={resume.liked} variant="bordered" />
      </StickyBar>
    </Main>
  );
};
