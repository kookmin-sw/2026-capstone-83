import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReportStatus } from 'entities/manager/model/types/manager.type';
import { useManagerReports } from 'entities/manager/model/hooks/useManagerQueries';
import {
  formatDateTime,
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
} from 'entities/manager/lib/labels';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import Button from 'shared/ui/Button/Button';
import { InputText } from 'shared/ui/Input/InputText';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import Badge from 'shared/ui/Badge/Badge';
import {
  DataTable,
  EmptyMessage,
  FilterField,
  FilterRow,
  PageDesc,
  PageHeader,
  PageTitle,
  Pagination,
} from 'widgets/manager/admin.styled';

const statusBadge = (status: ReportStatus): 'warning' | 'primary' | 'success' => {
  if (status === 'PENDING') return 'warning';
  if (status === 'IN_PROGRESS') return 'primary';
  return 'success';
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useManagerReports({
    keyword: searchKeyword || undefined,
    status: status || undefined,
    page,
    size: 10,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchKeyword(keyword.trim());
  };

  return (
    <>
      <PageHeader>
        <PageTitle>신고 관리</PageTitle>
        <PageDesc>접수된 신고를 조회하고 처리 상태를 변경합니다.</PageDesc>
      </PageHeader>

      <Section title="신고 검색">
        <FilterRow as="form" onSubmit={handleSearch}>
          <FilterField style={{ maxWidth: 280, flex: 2 }}>
            <InputText
              label="신고자 / 피신고자"
              labelSize="xsmall"
              placeholder="이름 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </FilterField>
          <FilterField>
            <InputSelect
              label="상태"
              labelSize="xsmall"
              options={[
                { value: '', label: '전체' },
                { value: 'PENDING', label: '미처리' },
                { value: 'IN_PROGRESS', label: '처리중' },
                { value: 'RESOLVED', label: '처리완료' },
              ]}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ReportStatus | '');
                setPage(0);
              }}
            />
          </FilterField>
          <Button type="submit" scheme="primary" buttonSize="medium" borderRadius="medium">
            검색
          </Button>
        </FilterRow>
      </Section>

      <Section title={`신고 목록${data ? ` (${data.totalElements}건)` : ''}`}>
        {(isLoading || isFetching) && <Loading />}
        {!isLoading && data && data.content.length === 0 && (
          <EmptyMessage>신고 내역이 없습니다.</EmptyMessage>
        )}
        {!isLoading && data && data.content.length > 0 && (
          <>
            <DataTable>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>사유</th>
                  <th>신고자</th>
                  <th>피신고자</th>
                  <th>접수일</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((report) => (
                  <tr key={report.id} onClick={() => navigate(`/admin/reports/${report.id}`)}>
                    <td>
                      <Badge scheme={statusBadge(report.status)} fontSize="xsmall">
                        {REPORT_STATUS_LABEL[report.status]}
                      </Badge>
                    </td>
                    <td>{REPORT_REASON_LABEL[report.reason]}</td>
                    <td>{report.reporterName}</td>
                    <td>{report.targetName}</td>
                    <td>{formatDateTime(report.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>

            <Pagination>
              <Button
                scheme="secondary"
                buttonSize="small"
                borderRadius="medium"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <span>
                {data.number + 1} / {Math.max(data.totalPages, 1)}
              </span>
              <Button
                scheme="secondary"
                buttonSize="small"
                borderRadius="medium"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </Pagination>
          </>
        )}
      </Section>
    </>
  );
};

export default AdminReportsPage;
