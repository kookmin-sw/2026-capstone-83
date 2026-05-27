import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useApplications } from 'entities/application/model/hooks/useApplications';
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_BADGE_SCHEME,
  WORKER_APPLICATION_STATUS_ORDER,
} from 'entities/application/lib/applicationStatusLabels';
import type { ApplicationStatus, ApplicationWithJobPost } from 'entities/application/model/types/application.type';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import { AcceptOfferButton } from 'features/application/AcceptOfferButton';
import { AcceptApprovalButton } from 'features/application/AcceptApprovalButton';
import { PendingEmployerConfirmNotice } from 'features/application/PendingEmployerConfirmNotice';
import { RejectOfferButton } from 'features/application/RejectOfferButton';
import { isPendingOfferFlow } from 'entities/application/lib/applicationFlow';
import { CardActionGroup } from 'shared/ui/CardActionGroup/CardActionGroup';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import { EmployeeReviewSection } from 'features/review/EmployeeReviewSection';
import ReportContextMenu from 'features/report/ReportContextMenu';
import ReportUserModal from 'features/report/ReportUserModal';
import { useReportEligibility } from 'features/report/useReportEligibility';

export const ApplicationListByStatus = () => {
  const { data: applications, isLoading } = useApplications();
  const canReportTarget = useReportEligibility();
  const [ctxMenu, setCtxMenu] = useState<{
    anchorRect: DOMRect;
    app: ApplicationWithJobPost;
  } | null>(null);
  const [reportApp, setReportApp] = useState<ApplicationWithJobPost | null>(null);

  const grouped = useMemo(() => {
    if (!applications) return {};
    return applications.reduce<Record<string, ApplicationWithJobPost[]>>((acc, app) => {
      const status = app.applicationStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(app);
      return acc;
    }, {});
  }, [applications]);

  const renderHeaderActions = (app: ApplicationWithJobPost) => {
    const status = app.applicationStatus;

    if (status === 'OFFERED') {
      return (
        <CardActionGroup>
          <AcceptOfferButton applicationId={app.applicationId} />
          <RejectOfferButton applicationId={app.applicationId} />
        </CardActionGroup>
      );
    }
    if (status === 'PENDING') {
      if (isPendingOfferFlow(app.initiatedBy)) {
        return (
          <S.PendingActions>
            <PendingEmployerConfirmNotice />
            <CardActionGroup>
              <RejectOfferButton applicationId={app.applicationId} />
            </CardActionGroup>
          </S.PendingActions>
        );
      }
      return (
        <CardActionGroup>
          <AcceptApprovalButton applicationId={app.applicationId} />
          <RejectOfferButton applicationId={app.applicationId} />
        </CardActionGroup>
      );
    }
    if (status === 'APPLIED') {
      return (
        <CardActionGroup>
          <RejectOfferButton applicationId={app.applicationId} />
        </CardActionGroup>
      );
    }
    if (status === 'HIRED') {
      return (
        <CardActionGroup>
          <RejectOfferButton applicationId={app.applicationId} variant="hired" />
        </CardActionGroup>
      );
    }
    return undefined;
  };

  const renderJobPostCard = (app: ApplicationWithJobPost, status: ApplicationStatus) => {
    const reviewFooter =
      status === 'COMPLETED' ? (
        <EmployeeReviewSection applicationId={app.applicationId} canWrite embedded />
      ) : undefined;

    return (
      <JobPostCard
        data={app}
        headerActions={renderHeaderActions(app)}
        footerSlot={reviewFooter}
      />
    );
  };

  const renderStatusSection = (status: ApplicationStatus, options?: { fullWidth?: boolean }) => {
    const list = grouped[status] || [];
    if (list.length === 0) return null;

    const SectionWrap = options?.fullWidth ? S.FullWidthSection : S.Section;

    return (
      <SectionWrap key={status}>
        <S.SectionHeader>
          <S.SectionTitle>{APPLICATION_STATUS_LABEL[status]}</S.SectionTitle>
          <Badge scheme={APPLICATION_STATUS_BADGE_SCHEME[status]}>{list.length}건</Badge>
        </S.SectionHeader>

        <S.CardList>
          {list.map((app) => (
            <S.CardItem key={app.applicationId}>
              <S.CardContextHitArea
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const employerId = app.employerUserId;
                  if (employerId == null || !canReportTarget(employerId)) return;
                  setCtxMenu({
                    anchorRect: (e.currentTarget as HTMLElement).getBoundingClientRect(),
                    app,
                  });
                }}
              >
                {renderJobPostCard(app, status)}
              </S.CardContextHitArea>
            </S.CardItem>
          ))}
        </S.CardList>
      </SectionWrap>
    );
  };

  if (isLoading) return <Loading message="지원 이력을 불러오는 중..." />;
  if (!applications || applications.length === 0) return <Empty message="지원 이력이 없습니다." />;

  const hasAny = WORKER_APPLICATION_STATUS_ORDER.some((key) => (grouped[key]?.length ?? 0) > 0);
  if (!hasAny) return <Empty message="지원 이력이 없습니다." />;

  const appliedSection = renderStatusSection('APPLIED');
  const pendingSection = renderStatusSection('PENDING');
  const hiredSection = renderStatusSection('HIRED');
  const completedSection = renderStatusSection('COMPLETED', { fullWidth: true });
  const rightColumn = (
    <>
      {pendingSection}
      {hiredSection}
    </>
  );
  const hasRightColumn = Boolean(pendingSection || hiredSection);
  const showTwoColumns = Boolean(appliedSection && hasRightColumn);

  return (
    <S.Wrapper>
      {showTwoColumns ? (
        <S.TwoColumnRow>
          <S.Column>{appliedSection}</S.Column>
          <S.Column>{rightColumn}</S.Column>
        </S.TwoColumnRow>
      ) : (
        <>
          {appliedSection}
          {rightColumn}
        </>
      )}

      {completedSection}

      {renderStatusSection('OFFERED')}
      {renderStatusSection('REJECTED')}

      {ctxMenu &&
        ctxMenu.app.employerUserId != null &&
        canReportTarget(ctxMenu.app.employerUserId) && (
          <ReportContextMenu
            anchorRect={ctxMenu.anchorRect}
            onClose={() => setCtxMenu(null)}
            onReport={() => {
              setReportApp(ctxMenu.app);
              setCtxMenu(null);
            }}
          />
        )}

      {reportApp && reportApp.employerUserId != null && (
        <ReportUserModal
          isOpen
          onClose={() => setReportApp(null)}
          targetUserId={reportApp.employerUserId}
          targetLabel={reportApp.company}
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
    gap: 24px;
  `,
  TwoColumnRow: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  `,
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  `,
  FullWidthSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  SectionTitle: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  CardList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  CardItem: styled.div`
    font-size: 16px;
    min-width: 0;
  `,
  CardContextHitArea: styled.div`
    min-width: 0;
  `,
  PendingActions: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  `,
};

