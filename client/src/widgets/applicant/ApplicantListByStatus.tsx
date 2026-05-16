import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useApplicants } from 'entities/application/model/hooks/useApplicants';
import type { ApplicantResponse, ApplicationStatus } from 'entities/application/model/types/application.type';
import { ApplicantCard } from 'entities/application/ui/ApplicantCard';
import { AcceptApplicantButton } from 'features/applicant/AcceptApplicantButton';
import { RejectApplicantButton } from 'features/applicant/RejectApplicantButton';
import { CancelHireButton } from 'features/applicant/CancelHireButton';
import { fetchMockResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from 'entities/resume/model/types/resume.type';
import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import Modal from 'shared/ui/Modal/Modal';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import type { BadgeScheme } from 'shared/types/theme';

interface Props {
  jobPostId: number;
}

interface StatusSection {
  key: ApplicationStatus;
  label: string;
  scheme: BadgeScheme;
}

const STATUS_SECTIONS: StatusSection[] = [
  { key: 'APPLIED', label: '지원중', scheme: 'primary' },
  { key: 'PENDING', label: '승인 대기', scheme: 'neutral' },
  { key: 'HIRED', label: '채용 완료', scheme: 'success' },
];

export const ApplicantListByStatus = ({ jobPostId }: Props) => {
  const { data: applicants, isLoading } = useApplicants(jobPostId);
  const [selectedResume, setSelectedResume] = useState<ResumeResponse | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);

  const grouped = useMemo(() => {
    if (!applicants) return {};
    return applicants.reduce<Record<string, ApplicantResponse[]>>((acc, applicant) => {
      const status = applicant.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(applicant);
      return acc;
    }, {});
  }, [applicants]);

  const handleCardClick = async (applicant: ApplicantResponse) => {
    setIsResumeModalOpen(true);
    setIsResumeLoading(true);
    try {
      // mock: userId를 이력서 id 범위(1~15)로 매핑
      const resumeId = ((applicant.userId - 1) % 15) + 1;
      const resume = await fetchMockResume(resumeId);
      setSelectedResume(resume);
    } catch {
      setSelectedResume(null);
    } finally {
      setIsResumeLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResume(null);
  };

  if (isLoading) return <Loading message="지원자 목록을 불러오는 중..." />;
  if (!applicants || applicants.length === 0) return <Empty message="지원자가 없습니다." />;

  const renderActions = (status: ApplicationStatus, applicant: ApplicantResponse) => {
    switch (status) {
      case 'APPLIED':
        return (
          <>
            <AcceptApplicantButton applicationId={applicant.userId} jobPostId={jobPostId} />
            <RejectApplicantButton applicationId={applicant.userId} jobPostId={jobPostId} />
          </>
        );
      case 'PENDING':
      case 'HIRED':
        return (
          <CancelHireButton applicationId={applicant.userId} jobPostId={jobPostId} />
        );
      default:
        return null;
    }
  };

  return (
    <S.Wrapper>
      {STATUS_SECTIONS.map(({ key, label, scheme }) => {
        const list = grouped[key] || [];
        return (
          <S.Section key={key}>
            <S.SectionHeader>
              <S.SectionTitle>{label}</S.SectionTitle>
              <Badge scheme={scheme}>{list.length}명</Badge>
            </S.SectionHeader>

            {list.length > 0 ? (
              <S.CardList>
                {list.map((applicant) => (
                  <ApplicantCard
                    key={applicant.userId}
                    data={applicant}
                    actions={renderActions(key, applicant)}
                    onClick={() => handleCardClick(applicant)}
                  />
                ))}
              </S.CardList>
            ) : (
              <S.EmptyText>해당 상태의 지원자가 없습니다.</S.EmptyText>
            )}
          </S.Section>
        );
      })}

      {/* 이력서 상세 모달 */}
      <Modal isOpen={isResumeModalOpen} onClose={handleCloseModal}>
        {isResumeLoading ? (
          <Loading message="이력서를 불러오는 중..." />
        ) : selectedResume ? (
          <ResumeDetailView data={selectedResume} />
        ) : (
          <S.NoResumeText>이력서 정보를 찾을 수 없습니다.</S.NoResumeText>
        )}
      </Modal>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  SectionTitle: styled.h4`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  CardList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  EmptyText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    padding: 16px;
    text-align: center;
    background-color: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    margin: 0;
  `,
  NoResumeText: styled.p`
    text-align: center;
    padding: 40px 20px;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  `,
};
