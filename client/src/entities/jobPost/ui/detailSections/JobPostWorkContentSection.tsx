
import styled from 'styled-components'
import type { JobPostWorkContentProps } from '../../model/types/jobPost.type';
import { CERTIFICATE_LABEL } from 'shared/types/certificate';
import type { CertificateType } from 'shared/types/certificate';
import Section from 'shared/ui/Layout/Section';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';

const ALL_CERT_TYPES = Object.keys(CERTIFICATE_LABEL) as CertificateType[];

export const JobPostWorkContentSection = ({ data }: { data: JobPostWorkContentProps }) => {

  if (!data) {
    return <Loading message="근무 내용을 불러오는 중..." />;
  }

  const { requirements, tasks, benefits, items } = data;

  // requirements에서 자격증 타입과 일반 텍스트 분리
  const certRequirements = (requirements || []).filter((r) => ALL_CERT_TYPES.includes(r as CertificateType));
  const textRequirements = (requirements || []).filter((r) => !ALL_CERT_TYPES.includes(r as CertificateType));

  return (
    <Section title="근무 내용">
      <S.WorkGrid>
        <S.GridItem>
          <span className="label">지원 조건</span>
          <span className="value">{textRequirements.length > 0 ? textRequirements.join(', ') : '학력 무관'}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">업무 내용</span>
          <span className="value">{tasks.join(', ')}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">우대 조건</span>
          <span className="value">{benefits?.join(', ') || '-'}</span>
        </S.GridItem>
        <S.GridItem>
          <span className="label">준비물</span>
          <span className="value">{items?.join(', ') || '-'}</span>
        </S.GridItem>
        {certRequirements.length > 0 && (
          <S.GridItem>
            <span className="label">필수 자격</span>
            <S.CertBadges>
              {certRequirements.map((cert) => (
                <Badge key={cert} scheme="secondary">
                  {CERTIFICATE_LABEL[cert as CertificateType]}
                </Badge>
              ))}
            </S.CertBadges>
          </S.GridItem>
        )}
      </S.WorkGrid>
    </Section>
  );
};

const S = {
  WorkGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 24px 40px;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
  `,
  GridItem: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    .label { color: ${({ theme }) => theme.color.subText}; font-size: 14px; }
    .value { line-height: 1.5; color: ${({ theme }) => theme.color.text}; }
  `,
  CertBadges: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `,
};