import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useApplicants } from 'entities/application/model/hooks/useApplicants';
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_BADGE_SCHEME,
  EMPLOYER_APPLICATION_STATUS_ORDER,
} from 'entities/application/lib/applicationStatusLabels';
import type { ApplicantResponse, ApplicationStatus } from 'entities/application/model/types/application.type';
import { ApplicantCard } from 'entities/application/ui/ApplicantCard';
import { AcceptApplicantButton } from 'features/applicant/AcceptApplicantButton';
import { ConfirmHireButton } from 'features/applicant/ConfirmHireButton';
import { RejectApplicantButton } from 'features/applicant/RejectApplicantButton';
import { CancelHireButton } from 'features/applicant/CancelHireButton';
import { OfferJobButton } from 'features/offer/OfferJobButton';
import { CardActionGroup } from 'shared/ui/CardActionGroup/CardActionGroup';
import { useResumeDetail } from 'entities/resume/model/hooks/useResumeDetail';
import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import Modal from 'shared/ui/Modal/Modal';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import { EmployerReviewSection } from 'features/review/EmployerReviewSection';

interface Props {
  jobPostId: number;
}

export const ApplicantListByStatus = ({ jobPostId }: Props) => {
  const { data: applicants, isLoading } = useApplicants(jobPostId);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>();
  const [selectedApplicantUserId, setSelectedApplicantUserId] = useState<number | undefined>();
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const {
    data: selectedResume,
    isPending: isResumePending,
    isError: isResumeError,
  } = useResumeDetail(selectedResumeId, isResumeModalOpen);

  const grouped = useMemo(() => {
    if (!applicants) return {};
    return applicants.reduce<Record<string, ApplicantResponse[]>>((acc, applicant) => {
      const status = applicant.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(applicant);
      return acc;
    }, {});
  }, [applicants]);

  const handleCardClick = (applicant: ApplicantResponse) => {
    setSelectedResumeId(applicant.resumeId ?? undefined);
    setSelectedApplicantUserId(applicant.userId);
    setIsResumeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsResumeModalOpen(false);
    setSelectedResumeId(undefined);
    setSelectedApplicantUserId(undefined);
  };

  if (isLoading) return <Loading message="지원자 목록을 불러오는 중..." />;
  if (!applicants || applicants.length === 0) return <Empty message="지원자가 없습니다." />;

  const renderActions = (status: ApplicationStatus, applicant: ApplicantResponse) => {
    switch (status) {
      case 'APPLIED':
        return (
          <CardActionGroup>
            <AcceptApplicantButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
            <RejectApplicantButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
          </CardActionGroup>
        );
      case 'OFFERED':
        return (
          <CardActionGroup>
            <RejectApplicantButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
          </CardActionGroup>
        );
      case 'PENDING':
        return (
          <CardActionGroup>
            <ConfirmHireButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
            <RejectApplicantButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
          </CardActionGroup>
        );
      case 'REJECTED':
        return (
          <CardActionGroup>
            <OfferJobButton jobPostId={jobPostId} userId={applicant.userId} />
          </CardActionGroup>
        );
      case 'HIRED':
        return (
          <CardActionGroup>
            <CancelHireButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
          </CardActionGroup>
        );
      default:
        return null;
    }
  };

  return (
    <S.Wrapper>
      {EMPLOYER_APPLICATION_STATUS_ORDER.map((key) => {
        const list = grouped[key] || [];
        if (list.length === 0) return null;

        return (
          <S.Section key={key}>
            <S.SectionHeader>
              <S.SectionTitle>{APPLICATION_STATUS_LABEL[key]}</S.SectionTitle>
              <Badge scheme={APPLICATION_STATUS_BADGE_SCHEME[key]}>{list.length}명</Badge>
            </S.SectionHeader>

            <S.CardList>
              {list.map((applicant) => (
                <ApplicantCard
                  key={applicant.applicationId}
                  data={applicant}
                  actions={renderActions(key, applicant)}
                  reviewSlot={<EmployerReviewSection applicationId={applicant.applicationId} />}
                  onClick={() => handleCardClick(applicant)}
                />
              ))}
            </S.CardList>
          </S.Section>
        );
      })}

      <Modal isOpen={isResumeModalOpen} onClose={handleCloseModal}>
        {!selectedResumeId ? (
          <S.NoResumeText>이력서 정보를 찾을 수 없습니다.</S.NoResumeText>
        ) : isResumePending ? (
          <Loading message="이력서를 불러오는 중..." />
        ) : selectedResume && !isResumeError ? (
          <ResumeDetailView
            data={selectedResume}
            actions={
              selectedApplicantUserId ? (
                <OfferJobButton jobPostId={jobPostId} userId={selectedApplicantUserId} />
              ) : undefined
            }
          />
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
  NoResumeText: styled.p`
    text-align: center;
    padding: 40px 20px;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  `,
};
