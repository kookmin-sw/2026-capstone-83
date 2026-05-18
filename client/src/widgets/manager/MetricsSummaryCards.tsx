import type { MetricsSummary } from 'entities/manager/model/types/manager.type';
import { formatMetric, formatPercent } from 'entities/manager/lib/labels';
import { MetricCard, MetricGrid } from './admin.styled';

interface Props {
  summary: MetricsSummary;
}

const MetricsSummaryCards = ({ summary }: Props) => {
  const cards = [
    {
      label: '노출 수',
      value: summary.impressions.toLocaleString(),
      sub: `최근 ${summary.periodDays}일`,
    },
    { label: '클릭 수', value: summary.clicks.toLocaleString() },
    { label: '지원 수', value: summary.applications.toLocaleString() },
    { label: 'CTR', value: formatPercent(summary.ctr) },
    { label: 'CVR (노출→지원)', value: formatPercent(summary.cvrByImpression) },
    { label: 'CVR (클릭→지원)', value: formatPercent(summary.cvrByClick) },
    { label: 'NDCG@10', value: formatMetric(summary.ndcgAt10) },
  ];

  return (
    <MetricGrid>
      {cards.map(({ label, value, sub }) => (
        <MetricCard key={label}>
          <p className="label">{label}</p>
          <p className="value">{value}</p>
          {sub && <p className="sub">{sub}</p>}
        </MetricCard>
      ))}
    </MetricGrid>
  );
};

export default MetricsSummaryCards;
