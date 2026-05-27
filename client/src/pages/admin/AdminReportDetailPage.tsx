import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  useManagerReport,
  useManagerUser,
} from 'entities/manager/model/hooks/useManagerQueries';
import {
  formatDateTime,
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
} from 'entities/manager/lib/labels';
import ReportStatusForm from 'features/manager/ReportStatusForm';
import UserSuspendForm from 'features/manager/UserSuspendForm';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import Badge from 'shared/ui/Badge/Badge';
import {
  DetailGrid,
  PageDesc,
  PageHeader,
  PageTitle,
} from 'widgets/manager/admin.styled';

const AdminReportDetailPage = () => {
  const { id } = useParams();
  const reportId = Number(id);
  const { data: report, isLoading, refetch } = useManagerReport(reportId);
  const { data: targetUser, isPending: targetUserLoading } = useManagerUser(report?.targetUserId ?? 0);

  if (isLoading) return <Loading />;
  if (!report) return <p>신고를 찾을 수 없습니다.</p>;

  return (
    <>
      <PageHeader>
        <PageTitle>신고 #{report.id}</PageTitle>
        <PageDesc>
          <Link to="/admin/reports">← 신고 목록</Link>
        </PageDesc>
      </PageHeader>

      <Section title="신고 내용">
        <DetailGrid>
          <dt>상태</dt>
          <dd>
            <Badge scheme="primary">{REPORT_STATUS_LABEL[report.status]}</Badge>
          </dd>
          <dt>사유</dt>
          <dd>{REPORT_REASON_LABEL[report.reason]}</dd>
          <dt>신고자</dt>
          <dd>
            {report.reporterName} (ID {report.reporterUserId})
          </dd>
          <dt>피신고자</dt>
          <dd>
            {report.targetName} (ID {report.targetUserId})
          </dd>
          <dt>접수일</dt>
          <dd>{formatDateTime(report.createdAt)}</dd>
          <dt>처리 완료</dt>
          <dd>{formatDateTime(report.resolvedAt)}</dd>
          <dt>상세 내용</dt>
          <dd style={{ whiteSpace: 'pre-wrap' }}>{report.detail || '-'}</dd>
          {report.adminNote && (
            <>
              <dt>관리자 메모</dt>
              <dd style={{ whiteSpace: 'pre-wrap' }}>{report.adminNote}</dd>
            </>
          )}
        </DetailGrid>
      </Section>

      <Section title="처리">
        <ReportStatusForm
          reportId={reportId}
          currentStatus={report.status}
          currentNote={report.adminNote}
        />

        <S.SuspendBlock>
          <S.SuspendHeading>피신고자 계정 정지</S.SuspendHeading>
          <S.SuspendDesc>
            <span>
              <strong>{report.targetName}</strong> (회원 ID {report.targetUserId})
            </span>
            <Link to={`/admin/users/${report.targetUserId}`}>회원 상세 →</Link>
          </S.SuspendDesc>
          {!targetUserLoading && targetUser && (
            <S.TargetMeta>
              <Badge scheme={targetUser.status === 'ACTIVE' ? 'success' : 'error'}>
                {USER_STATUS_LABEL[targetUser.status]}
              </Badge>
              <span className="role">{USER_ROLE_LABEL[targetUser.role]}</span>
            </S.TargetMeta>
          )}
          {targetUserLoading ? (
            <S.ManagerNotice>피신고자 회원 정보를 불러오는 중입니다…</S.ManagerNotice>
          ) : targetUser?.role === 'MANAGER' ? (
            <S.ManagerNotice>관리자 계정은 정지 처리할 수 없습니다.</S.ManagerNotice>
          ) : (
            <UserSuspendForm userId={report.targetUserId} onSuccess={() => refetch()} />
          )}
        </S.SuspendBlock>
      </Section>
    </>
  );
};

export default AdminReportDetailPage;

const S = {
  SuspendBlock: styled.div`
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  SuspendHeading: styled.h3`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  SuspendDesc: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};

    a {
      color: ${({ theme }) => theme.color.primary};
      font-weight: ${({ theme }) => theme.fontWeight.medium};
    }
  `,
  TargetMeta: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: ${({ theme }) => theme.fontSize.small};

    .role {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  ManagerNotice: styled.p`
    margin: 0;
    padding: 12px 14px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.subBackground};
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
};
