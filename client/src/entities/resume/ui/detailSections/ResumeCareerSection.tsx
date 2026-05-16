import styled from 'styled-components';
import Section from 'shared/ui/Layout/Section';
import type { Career, EducationLevel, ResumeResponse, SchoolStatus } from '../../model/types/resume.type';
import { CERTIFICATE_LABEL } from 'shared/types/certificate';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  data: ResumeResponse | null;
}

const EDUCATION_LABELS: Record<EducationLevel, string> = {
  HIGH: '고등학교',
  COLLEGE: '대학(2,3년제)',
  UNIVERSITY: '대학(4년제)',
  GRADUATE: '대학원',
};

const STATUS_LABELS: Record<SchoolStatus, string> = {
  GRADUATED: '졸업',
  ENROLLED: '재학중',
  EXPECTED: '졸업예정',
  LEAVE: '휴학중',
  DROPPED: '중퇴',
};

const formatCareerDuration = (years: number, months: number) => {
  const parts = [];
  if (years > 0) parts.push(`${years}년`);
  if (months > 0) parts.push(`${months}개월`);
  return parts.join(' ') || '0개월';
};

const getTotalCareer = (careers: Career[]) => {
  let totalMonths = careers.reduce((sum, c) => sum + (c.years * 12) + c.months, 0);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return formatCareerDuration(years, months);
};

export const ResumeCareerSection = ({ data }: Props) => {
  if (!data) {
    return <Loading message="경력 정보를 불러오는 중..." />;
  }

  const { education, educationStatus, major, careers, certificates } = data;

  return (
    <Section title="경력">
      <S.CareerContent>
        {/* 학력 */}
        <S.InfoRow>
          <span className="label">학력</span>
          <span className="value">
            {EDUCATION_LABELS[education]} {STATUS_LABELS[educationStatus]}
            {major && ` - ${major}`}
          </span>
        </S.InfoRow>

        {/* 경력 목록 */}
        {careers && careers.length > 0 && (
          <S.CareerList>
            <S.InfoRow>
              <span className="label">총 경력</span>
              <span className="value highlight">{getTotalCareer(careers)}</span>
            </S.InfoRow>

            <S.CareerItems>
              {careers.map((career) => (
                <S.CareerItem key={career.id}>
                  {career.jobTitle} ({formatCareerDuration(career.years, career.months)})
                </S.CareerItem>
              ))}
            </S.CareerItems>
          </S.CareerList>
        )}

        {/* 자격/인증 */}
        {certificates && certificates.length > 0 && (
          <S.CertSection>
            <S.InfoRow>
              <span className="label">자격/인증</span>
            </S.InfoRow>
            <S.CertList>
              {certificates.map((cert) => (
                <Badge key={cert.id} scheme="secondary">
                  {CERTIFICATE_LABEL[cert.type]}
                </Badge>
              ))}
            </S.CertList>
          </S.CertSection>
        )}
      </S.CareerContent>
    </Section>
  );
};

const S = {
  CareerContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  InfoRow: styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: ${({ theme }) => theme.fontSize.small};
    .label {
      color: ${({ theme }) => theme.color.subText};
      width: 60px;
      flex-shrink: 0;
    }
    .value {
      color: ${({ theme }) => theme.color.text};
    }
    .highlight {
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
  CareerList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  CareerItems: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 16px;
    border-left: 3px solid ${({ theme }) => theme.color.border};
  `,
  CareerItem: styled.div`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.thirdText};
    line-height: 1.6;
  `,
  CertSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  CertList: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-left: 16px;
  `,
};
