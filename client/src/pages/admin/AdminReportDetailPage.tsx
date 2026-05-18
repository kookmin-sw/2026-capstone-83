import { Link, useParams } from 'react-router-dom';
import { useManagerReport } from 'entities/manager/model/hooks/useManagerQueries';
import {
  formatDateTime,
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
} from 'entities/manager/lib/labels';
import ReportStatusForm from 'features/manager/ReportStatusForm';
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
  const { data: report, isLoading } = useManagerReport(reportId);

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
      </Section>
    </>
  );
};

export default AdminReportDetailPage;
