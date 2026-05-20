import { useMemo } from 'react';
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
import { isPendingAfterOfferAccept } from 'entities/application/lib/pendingFlowStorage';
import { CardActionGroup } from 'shared/ui/CardActionGroup/CardActionGroup';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

export const ApplicationListByStatus = () => {
  const { data: applications, isLoading } = useApplications();

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
      const waitingEmployer = isPendingAfterOfferAccept(app.applicationId);
      if (waitingEmployer) {
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

  const renderStatusSection = (status: ApplicationStatus) => {
    const list = grouped[status] || [];
    if (list.length === 0) return null;

    return (
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>{APPLICATION_STATUS_LABEL[status]}</S.SectionTitle>
          <Badge scheme={APPLICATION_STATUS_BADGE_SCHEME[status]}>{list.length}건</Badge>
        </S.SectionHeader>

        <S.CardList>
          {list.map((app) => (
            <S.CardItem key={app.applicationId}>
              <JobPostCard data={app} headerActions={renderHeaderActions(app)} />
            </S.CardItem>
          ))}
        </S.CardList>
      </S.Section>
    );
  };

  if (isLoading) return <Loading message="지원 이력을 불러오는 중..." />;
  if (!applications || applications.length === 0) return <Empty message="지원 이력이 없습니다." />;

  const hasAny = WORKER_APPLICATION_STATUS_ORDER.some((key) => (grouped[key]?.length ?? 0) > 0);
  if (!hasAny) return <Empty message="지원 이력이 없습니다." />;

  const appliedSection = renderStatusSection('APPLIED');
  const pendingSection = renderStatusSection('PENDING');
  const hiredSection = renderStatusSection('HIRED');
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

      {renderStatusSection('OFFERED')}
      {renderStatusSection('REJECTED')}
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
  PendingActions: styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  `,
};
