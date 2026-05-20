import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useApplications } from 'entities/application/model/hooks/useApplications';
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_BADGE_SCHEME,
  WORKER_APPLICATION_STATUS_ORDER,
} from 'entities/application/lib/applicationStatusLabels';
import type { ApplicationStatus, ApplicationWithJobPost } from 'entities/application/model/types/application.type';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import { formatScheduleLine } from 'entities/jobPost/lib/jobPostCardDisplay';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import {
  groupApplicationsByStatus,
  renderApplicationHeaderActions,
} from './applicationListShared';

type HiredLayoutVariant = 'maxWidth' | 'compact' | 'tabs';

export const ApplicationListLayoutComparison = () => {
  const { data: applications, isLoading } = useApplications();

  const grouped = useMemo(
    () => (applications ? groupApplicationsByStatus(applications) : {}),
    [applications],
  );

  if (isLoading) return <Loading message="지원 이력을 불러오는 중..." />;
  if (!applications || applications.length === 0) return <Empty message="지원 이력이 없습니다." />;

  const hasAny = WORKER_APPLICATION_STATUS_ORDER.some((key) => (grouped[key]?.length ?? 0) > 0);
  if (!hasAny) return <Empty message="지원 이력이 없습니다." />;

  const hiredCount = grouped.HIRED?.length ?? 0;

  return (
    <S.Page>
      <S.Banner>
        <strong>레이아웃 비교 (임시)</strong> — 옵션 2·3·4를 위에서 아래로 하나씩 보여줍니다. 확정 후 이
        화면은 제거할 예정입니다.
      </S.Banner>

      <S.Grid>
        <PreviewPanel
          optionLabel="옵션 2"
          title="카드 max-width"
          description="섹션은 전체 너비, 확정 카드만 최대 560px·왼쪽 정렬"
          variant="maxWidth"
          grouped={grouped}
          hiredCount={hiredCount}
        />
        <PreviewPanel
          optionLabel="옵션 3"
          title="컴팩트 리스트"
          description="확정 건만 한 줄(제목·일정·버튼), 클릭 시 공고 상세"
          variant="compact"
          grouped={grouped}
          hiredCount={hiredCount}
        />
        <PreviewPanel
          optionLabel="옵션 4"
          title="탭 분리"
          description="진행 중(지원·대기·제안·거절) | 채용 확정"
          variant="tabs"
          grouped={grouped}
          hiredCount={hiredCount}
        />
      </S.Grid>
    </S.Page>
  );
};

function PreviewPanel({
  optionLabel,
  title,
  description,
  variant,
  grouped,
  hiredCount,
}: {
  optionLabel: string;
  title: string;
  description: string;
  variant: HiredLayoutVariant;
  grouped: Record<string, ApplicationWithJobPost[]>;
  hiredCount: number;
}) {
  return (
    <S.Panel>
      <S.PanelHeader>
        <S.PanelLabel>{optionLabel}</S.PanelLabel>
        <S.PanelTitle>{title}</S.PanelTitle>
        <S.PanelDesc>{description}</S.PanelDesc>
      </S.PanelHeader>
      <S.PanelBody>
        <ApplicationListPreview variant={variant} grouped={grouped} hiredCount={hiredCount} />
      </S.PanelBody>
    </S.Panel>
  );
}

function ApplicationListPreview({
  variant,
  grouped,
  hiredCount,
}: {
  variant: HiredLayoutVariant;
  grouped: Record<string, ApplicationWithJobPost[]>;
  hiredCount: number;
}) {
  const [activeTab, setActiveTab] = useState<'progress' | 'hired'>('progress');

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
              <JobPostCard data={app} headerActions={renderApplicationHeaderActions(app)} />
            </S.CardItem>
          ))}
        </S.CardList>
      </S.Section>
    );
  };

  const renderHiredSection = () => {
    const list = grouped.HIRED || [];
    if (list.length === 0) {
      return (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>{APPLICATION_STATUS_LABEL.HIRED}</S.SectionTitle>
            <Badge scheme="success">0건</Badge>
          </S.SectionHeader>
          <S.HiredEmpty>채용 확정 건이 없으면 이 영역이 비어 보입니다.</S.HiredEmpty>
        </S.Section>
      );
    }

    if (variant === 'compact') {
      return (
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>{APPLICATION_STATUS_LABEL.HIRED}</S.SectionTitle>
            <Badge scheme="success">{list.length}건</Badge>
          </S.SectionHeader>
          <S.CompactList>
            {list.map((app) => (
              <S.CompactRow key={app.applicationId}>
                <S.CompactMain to={`/jobpost/${app.id}`}>
                  <S.CompactTitle>{app.title}</S.CompactTitle>
                  <S.CompactMeta>
                    {app.company} · {formatScheduleLine(app.workDate, app.workStart, app.workEnd)}
                  </S.CompactMeta>
                </S.CompactMain>
                <S.CompactActions>{renderApplicationHeaderActions(app)}</S.CompactActions>
              </S.CompactRow>
            ))}
          </S.CompactList>
        </S.Section>
      );
    }

    return (
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>{APPLICATION_STATUS_LABEL.HIRED}</S.SectionTitle>
          <Badge scheme="success">{list.length}건</Badge>
        </S.SectionHeader>
        <S.CardList>
          {list.map((app) => (
            <S.CardItem key={app.applicationId} $maxWidth={variant === 'maxWidth'}>
              <JobPostCard data={app} headerActions={renderApplicationHeaderActions(app)} />
            </S.CardItem>
          ))}
        </S.CardList>
      </S.Section>
    );
  };

  const renderInProgressBlock = () => {
    const topLeft = renderStatusSection('APPLIED');
    const topRight = renderStatusSection('PENDING');
    const hasTopRow = Boolean(topLeft || topRight);

    return (
      <>
        {hasTopRow && (
          <S.TwoColumnRow>
            <S.Column>{topLeft}</S.Column>
            <S.Column>{topRight}</S.Column>
          </S.TwoColumnRow>
        )}
        {renderStatusSection('OFFERED')}
        {renderStatusSection('REJECTED')}
      </>
    );
  };

  if (variant === 'tabs') {
    return (
      <S.Wrapper>
        <S.TabBar role="tablist">
          <S.Tab
            type="button"
            role="tab"
            aria-selected={activeTab === 'progress'}
            $active={activeTab === 'progress'}
            onClick={() => setActiveTab('progress')}
          >
            진행 중
          </S.Tab>
          <S.Tab
            type="button"
            role="tab"
            aria-selected={activeTab === 'hired'}
            $active={activeTab === 'hired'}
            onClick={() => setActiveTab('hired')}
          >
            채용 확정
            {hiredCount > 0 && <S.TabCount>{hiredCount}</S.TabCount>}
          </S.Tab>
        </S.TabBar>
        <S.TabPanel role="tabpanel">
          {activeTab === 'progress' ? renderInProgressBlock() : renderHiredSection()}
        </S.TabPanel>
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      {renderInProgressBlock()}
      {renderHiredSection()}
    </S.Wrapper>
  );
}

const S = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  Banner: styled.div`
    padding: 12px 16px;
    border-radius: 8px;
    background: ${({ theme }) => theme.color.secondary};
    border: 1px dashed ${({ theme }) => theme.color.border};
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
  Grid: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  Panel: styled.div`
    border: 2px solid ${({ theme }) => theme.color.border};
    border-radius: 12px;
    overflow: hidden;
    min-width: 0;
    background: ${({ theme }) => theme.color.background};
  `,
  PanelHeader: styled.div`
    padding: 12px 14px;
    background: ${({ theme }) => theme.color.secondary};
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  `,
  PanelLabel: styled.span`
    display: inline-block;
    font-size: 11px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.primary};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  `,
  PanelTitle: styled.h3`
    margin: 0 0 4px;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  `,
  PanelDesc: styled.p`
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.4;
  `,
  PanelBody: styled.div`
    padding: 16px;
  `,
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  TwoColumnRow: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: start;

    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }
  `,
  Column: styled.div`
    min-width: 0;
  `,
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  SectionTitle: styled.h4`
    font-size: 13px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  CardList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  CardItem: styled.div<{ $maxWidth?: boolean }>`
    min-width: 0;
    ${({ $maxWidth }) =>
      $maxWidth &&
      `
      max-width: 560px;
    `}
  `,
  HiredEmpty: styled.p`
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.color.subText};
  `,
  CompactList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  CompactRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.color.secondary};
    min-width: 0;
  `,
  CompactMain: styled(Link)`
    flex: 1;
    min-width: 0;
    text-decoration: none;
    color: inherit;
  `,
  CompactTitle: styled.div`
    font-size: 13px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  CompactMeta: styled.div`
    font-size: 11px;
    color: ${({ theme }) => theme.color.subText};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  `,
  CompactActions: styled.div`
    flex-shrink: 0;
  `,
  TabBar: styled.div`
    display: flex;
    gap: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    padding-bottom: 8px;
  `,
  Tab: styled.button<{ $active: boolean }>`
    flex: 1;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    cursor: pointer;
    background: ${({ theme, $active }) => ($active ? theme.color.primary : 'transparent')};
    color: ${({ theme, $active }) => ($active ? theme.color.white : theme.color.text)};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  `,
  TabCount: styled.span`
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.25);
  `,
  TabPanel: styled.div`
    min-height: 120px;
  `,
};
