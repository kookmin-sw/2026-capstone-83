import { useMemo, useState } from 'react';
import {
  useDailyMetrics,
  useMetricsSummary,
} from 'entities/manager/model/hooks/useManagerQueries';
import { formatMetric, formatPercent } from 'entities/manager/lib/labels';
import MetricsSummaryCards from 'widgets/manager/MetricsSummaryCards';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import { InputText } from 'shared/ui/Input/InputText';
import {
  DataTable,
  EmptyMessage,
  FilterField,
  FilterRow,
  PageDesc,
  PageHeader,
  PageTitle,
} from 'widgets/manager/admin.styled';

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const AdminDashboardPage = () => {
  const [summaryDays, setSummaryDays] = useState(30);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return toDateInput(d);
  });
  const [to, setTo] = useState(() => toDateInput(new Date()));

  const { data: summary, isLoading: summaryLoading } = useMetricsSummary(summaryDays);
  const { data: daily, isLoading: dailyLoading } = useDailyMetrics(from, to);

  const summaryOptions = useMemo(
    () => [
      { value: 7, label: '최근 7일' },
      { value: 30, label: '최근 30일' },
      { value: 90, label: '최근 90일' },
    ],
    []
  );

  return (
    <>
      <PageHeader>
        <PageTitle>관리자 대시보드</PageTitle>
        <PageDesc>추천 퍼널 지표(CTR, CVR, NDCG@10)를 확인합니다.</PageDesc>
      </PageHeader>

      <Section
        title="KPI 요약"
        action={
          <FilterField style={{ maxWidth: 160, margin: 0 }}>
            <InputSelect
              labelSize="xsmall"
              options={summaryOptions}
              value={summaryDays}
              onChange={(e) => setSummaryDays(Number(e.target.value))}
            />
          </FilterField>
        }
      >
        {summaryLoading && <Loading />}
        {summary && !summaryLoading && <MetricsSummaryCards summary={summary} />}
      </Section>

      <Section title="일별 추이">
        <FilterRow>
          <FilterField>
            <InputText
              label="시작일"
              labelSize="xsmall"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </FilterField>
          <FilterField>
            <InputText
              label="종료일"
              labelSize="xsmall"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </FilterField>
        </FilterRow>

        {dailyLoading && <Loading />}
        {!dailyLoading && daily && daily.length === 0 && (
          <EmptyMessage>해당 기간에 집계된 데이터가 없습니다.</EmptyMessage>
        )}
        {!dailyLoading && daily && daily.length > 0 && (
          <DataTable>
            <thead>
              <tr>
                <th>날짜</th>
                <th>노출</th>
                <th>클릭</th>
                <th>지원</th>
                <th>CTR</th>
                <th>CVR(노출)</th>
                <th>NDCG@10</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.impressions.toLocaleString()}</td>
                  <td>{row.clicks.toLocaleString()}</td>
                  <td>{row.applications.toLocaleString()}</td>
                  <td>{formatPercent(row.ctr)}</td>
                  <td>{formatPercent(row.cvrByImpression)}</td>
                  <td>{formatMetric(row.ndcgAt10)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Section>
    </>
  );
};

export default AdminDashboardPage;
