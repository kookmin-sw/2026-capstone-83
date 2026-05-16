import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ResumeCard } from 'entities/resume/ui/ResumeCard';
import { fetchResumes, fetchMockResumes } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from 'entities/resume/model/types/resume.type';
import LikeResumeButton from 'features/like/LikeResumeButton';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import { USE_MOCK } from 'shared/config/env';

export const ResumeList = () => {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const real = await fetchResumes()
        .then((res) => res.contents as unknown as ResumeResponse[])
        .catch(() => []);
      const mock = USE_MOCK ? await fetchMockResumes() : [];
      setResumes([...mock, ...real]);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <Loading message="인재 목록을 불러오는 중..." />;
  if (resumes.length === 0) return <Empty message="등록된 인재가 없습니다." />;

  return (
    <ListContainer>
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          data={resume}
          extraActions={<LikeResumeButton resumeId={resume.id} liked={resume.liked} variant="icon" />}
        />
      ))}
    </ListContainer>
  );
};

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  /* 태블릿 */
  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 모바일 */
  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    grid-template-columns: 1fr;
  }
`;
