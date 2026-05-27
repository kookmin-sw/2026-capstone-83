import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useApplicants } from 'entities/application/model/hooks/useApplicants';
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_BADGE_SCHEME,
  EMPLOYER_APPLICANT_TABS,
  EMPLOYER_APPLICANT_TAB_EMPTY_MESSAGE,
  EMPLOYER_APPLICANT_TAB_LABEL,
  EMPLOYER_APPLICANT_TAB_STATUSES,
  type EmployerApplicantTab,
} from 'entities/application/lib/applicationStatusLabels';
import type { ApplicantResponse, ApplicationStatus } from 'entities/application/model/types/application.type';
import { ApplicantCard } from 'entities/application/ui/ApplicantCard';
import { AcceptApplicantButton } from 'features/applicant/AcceptApplicantButton';
import { ConfirmHireButton } from 'features/applicant/ConfirmHireButton';
import { RejectApplicantButton } from 'features/applicant/RejectApplicantButton';
import { CancelHireButton } from 'features/applicant/CancelHireButton';
import { CompleteWorkButton } from 'features/applicant/CompleteWorkButton';
import { OfferJobButton } from 'features/offer/OfferJobButton';
import { CardActionGroup } from 'shared/ui/CardActionGroup/CardActionGroup';
import { useResumeDetail } from 'entities/resume/model/hooks/useResumeDetail';
import { ResumeDetailView } from 'entities/resume/ui/ResumeDetailView';
import Modal from 'shared/ui/Modal/Modal';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import { EmployerReviewSection } from 'features/review/EmployerReviewSection';
import { BulkOfferButton } from 'features/offer/BulkOfferButton';
import { ToggleLongTermWorkerButton } from 'features/longTermWorker/ToggleLongTermWorkerButton';
import { useJobPost } from 'entities/jobPost/model/hooks/useJobPost';
import ReportContextMenu from 'features/report/ReportContextMenu';
import ReportUserModal from 'features/report/ReportUserModal';
import { useReportEligibility } from 'features/report/useReportEligibility';

interface Props {
  jobPostId: number;
}

export const ApplicantListByStatus = ({ jobPostId }: Props) => {
  const { data: applicants, isLoading } = useApplicants(jobPostId);
  const { data: jobPost } = useJobPost(jobPostId);
  const canReportTarget = useReportEligibility();
  const canBulkOffer = jobPost?.status === 'OPEN';
  const [activeTab, setActiveTab] = useState<EmployerApplicantTab>('action');
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>();
  const [selectedApplicantUserId, setSelectedApplicantUserId] = useState<number | undefined>();
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{
    anchorRect: DOMRect;
    applicant: ApplicantResponse;
  } | null>(null);
  const [reportApplicant, setReportApplicant] = useState<ApplicantResponse | null>(null);

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

  const tabCounts = useMemo(() => {
    const counts = {} as Record<EmployerApplicantTab, number>;
    EMPLOYER_APPLICANT_TABS.forEach((tab) => {
      counts[tab] = EMPLOYER_APPLICANT_TAB_STATUSES[tab].reduce(
        (sum, status) => sum + (grouped[status]?.length ?? 0),
        0,
      );
    });
    return counts;
  }, [grouped]);

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
            <CompleteWorkButton
              applicationId={applicant.applicationId}
              jobPostId={jobPostId}
              applicantName={applicant.name}
            />
            <CancelHireButton applicationId={applicant.applicationId} jobPostId={jobPostId} />
          </CardActionGroup>
        );
      case 'COMPLETED':
        return null;
      default:
        return null;
    }
  };

  const renderStatusSection = (status: ApplicationStatus) => {
    const list = grouped[status] || [];
    if (list.length === 0) return null;

    return (
      <S.Section key={status}>
        <S.SectionHeader>
          <S.SectionTitle>{APPLICATION_STATUS_LABEL[status]}</S.SectionTitle>
          <Badge scheme={APPLICATION_STATUS_BADGE_SCHEME[status]}>{list.length}명</Badge>
        </S.SectionHeader>

        <S.CardList>
          {list.map((applicant) => (
            <ApplicantCard
              key={applicant.applicationId}
              data={applicant}
              actions={renderActions(status, applicant)}
              reviewSlot={
                <EmployerReviewSection
                  applicationId={applicant.applicationId}
                  canWrite={status === 'COMPLETED'}
                />
              }
              onClick={() => handleCardClick(applicant)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!canReportTarget(applicant.userId)) return;
                setCtxMenu({
                  anchorRect: (e.currentTarget as HTMLElement).getBoundingClientRect(),
                  applicant,
                });
              }}
            />
          ))}
        </S.CardList>
      </S.Section>
    );
  };

  const renderTabPanel = () => {
    const statuses = EMPLOYER_APPLICANT_TAB_STATUSES[activeTab];
    const hasAny = statuses.some((status) => (grouped[status]?.length ?? 0) > 0);

    if (!hasAny) {
      return <S.TabEmpty>{EMPLOYER_APPLICANT_TAB_EMPTY_MESSAGE[activeTab]}</S.TabEmpty>;
    }

    return (
      <S.TabPanelContent>{statuses.map((status) => renderStatusSection(status))}</S.TabPanelContent>
    );
  };

  return (
    <S.Wrapper>
      {canBulkOffer && (
        <S.BulkOfferRow>
          <BulkOfferButton jobPostId={jobPostId} />
        </S.BulkOfferRow>
      )}

      <S.TabBar role="tablist" aria-label="지원자 상태 탭">
        {EMPLOYER_APPLICANT_TABS.map((tab) => {
          const count = tabCounts[tab];
          return (
            <S.Tab
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              $active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {EMPLOYER_APPLICANT_TAB_LABEL[tab]}
              {count > 0 && (
                <S.TabCount $active={activeTab === tab}>{count}</S.TabCount>
              )}
            </S.Tab>
          );
        })}
      </S.TabBar>

      <S.TabPanel role="tabpanel">{renderTabPanel()}</S.TabPanel>

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
                <>
                  <ToggleLongTermWorkerButton
                    applicantUserId={selectedApplicantUserId}
                    stopPropagation
                  />
                  <OfferJobButton jobPostId={jobPostId} userId={selectedApplicantUserId} />
                </>
              ) : undefined
            }
          />
        ) : (
          <S.NoResumeText>이력서 정보를 찾을 수 없습니다.</S.NoResumeText>
        )}
      </Modal>

      {ctxMenu && canReportTarget(ctxMenu.applicant.userId) && (
        <ReportContextMenu
          anchorRect={ctxMenu.anchorRect}
          onClose={() => setCtxMenu(null)}
          onReport={() => {
            setReportApplicant(ctxMenu.applicant);
            setCtxMenu(null);
          }}
        />
      )}

      {reportApplicant && (
        <ReportUserModal
          isOpen
          onClose={() => setReportApplicant(null)}
          targetUserId={reportApplicant.userId}
          targetLabel={reportApplicant.name}
          onSuccess={() => {
            window.alert('신고가 접수되었습니다.');
          }}
        />
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  BulkOfferRow: styled.div`
    display: flex;
    justify-content: flex-end;
  `,
  TabBar: styled.div`
    display: flex;
    gap: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      flex-wrap: wrap;
    }
  `,
  Tab: styled.button<{ $active: boolean }>`
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    cursor: pointer;
    background: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.secondary)};
    color: ${({ theme, $active }) => ($active ? theme.color.white : theme.color.text)};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      opacity: ${({ $active }) => ($active ? 1 : 0.9)};
    }
  `,
  TabCount: styled.span<{ $active: boolean }>`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    padding: 2px 7px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    background: ${({ theme, $active }) =>
      $active ? 'rgba(255, 255, 255, 0.25)' : theme.color.border};
    color: inherit;
  `,
  TabPanel: styled.div`
    min-height: 80px;
  `,
  TabPanelContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  TabEmpty: styled.p`
    margin: 0;
    padding: 32px 16px;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
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
