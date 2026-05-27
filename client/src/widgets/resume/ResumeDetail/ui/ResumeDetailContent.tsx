import { useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { ResumeProfileSection } from 'entities/resume/ui/detailSections/ResumeProfileSection';
import { ResumeCareerSection } from 'entities/resume/ui/detailSections/ResumeCareerSection';
import { useResumeDetail } from 'entities/resume/model/hooks/useResumeDetail';
import LikeResumeButton from 'features/like/LikeResumeButton';
import { OfferFromResumeButton } from 'features/offer/OfferFromResumeButton';
import { ToggleLongTermWorkerButton } from 'features/longTermWorker/ToggleLongTermWorkerButton';
import ReportUserModal from 'features/report/ReportUserModal';
import { ReportOverviewButton } from 'features/report/ReportOverviewButton';
import { useReportEligibility } from 'features/report/useReportEligibility';
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import StickyBar from 'shared/ui/StickyBar/StickyBar';

/** 이름 줄: 좌측 좋아요, 우측 끝 신고 */
const EmployerNameLineActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  gap: 12px;
`;

interface Props {
  resumeId: number;
}

export const ResumeDetailContent = ({ resumeId }: Props) => {
  const { data: resume, isLoading, isError } = useResumeDetail(resumeId);
  const role = useAuthStore((s) => s.role);
  const isEmployer = role === 'EMPLOYER';
  const applicantUserId = resume?.userId;
  const [reportOpen, setReportOpen] = useState(false);
  const canReportTarget = useReportEligibility();

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 찾을 수 없습니다." />;

  const showApplicantReport =
    isEmployer && applicantUserId != null && canReportTarget(applicantUserId);

  return (
    <Main>
      <Article>
        <ResumeProfileSection
          data={resume}
          nameActions={
            isEmployer ? (
              <EmployerNameLineActions>
                <LikeResumeButton resumeId={resumeId} liked={resume.liked} variant="icon" />
                {showApplicantReport ? (
                  <ReportOverviewButton onClick={() => setReportOpen(true)} />
                ) : null}
              </EmployerNameLineActions>
            ) : undefined
          }
          footerActions={
            isEmployer && applicantUserId != null ? (
              <>
                <ToggleLongTermWorkerButton applicantUserId={applicantUserId} buttonSize="small" />
                <OfferFromResumeButton
                  userId={applicantUserId}
                  applicantName={resume.name}
                  buttonSize="small"
                />
              </>
            ) : undefined
          }
        />
        <ResumeCareerSection data={resume} />
      </Article>

      {isEmployer && applicantUserId != null && (
        <StickyBar>
          <LikeResumeButton resumeId={resumeId} liked={resume.liked} variant="bordered" />
          <OfferFromResumeButton
            userId={applicantUserId}
            applicantName={resume.name}
            buttonSize="small"
          />
        </StickyBar>
      )}

      {showApplicantReport && applicantUserId != null && (
        <ReportUserModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetUserId={applicantUserId}
          targetLabel={resume.name}
          onSuccess={() => {
            window.alert('신고가 접수되었습니다.');
          }}
        />
      )}
    </Main>
  );
};
