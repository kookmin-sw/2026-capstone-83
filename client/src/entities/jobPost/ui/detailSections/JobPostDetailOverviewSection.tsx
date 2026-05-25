import styled from 'styled-components';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { Calendar, Clock } from 'lucide-react';

import Section from 'shared/ui/Layout/Section';
import { calculateDDay } from 'shared/lib/calculateDDay';
import ResizedImage from 'shared/ui/ResizedImage/ResizedImage';
import type { JobPostOverviewProps } from '../../model/types/jobPost.type';
import { UrgentJobPostBadge } from '../UrgentJobPostBadge';
import Loading from 'shared/ui/Loading/Loading';


interface Props {
  data: JobPostOverviewProps | null;
  headerActions?: React.ReactNode;
  actions?: React.ReactNode;
}

export const JobPostDetailOverviewSection = ({ data, headerActions, actions }: Props) => {

  if (!data) {
    return <Loading message="공고 개요를 불러오는 중..." />;
  }

  const {
    title,
    company,
    createdAt,
    deadline,
    workDate,
    workStart,
    workEnd,
    wage,
    wageType,
    companyLogoUrl,
    totalSlots,
    filledSlots,
    urgentEnabled,
    urgentWageIncrease,
  } = data;

  return (
    <Section>
      <S.Container>
        {/* 상단 영역: 텍스트 + 이미지 */}
        <S.TopRow>
          <S.TextContent>
            <S.Header>
              <S.TitleRow>
                <S.TitleGroup>
                  <S.MainTitle>{title}</S.MainTitle>
                  <UrgentJobPostBadge urgentEnabled={urgentEnabled} />
                </S.TitleGroup>
                {headerActions && <S.HeaderActions>{headerActions}</S.HeaderActions>}
              </S.TitleRow>
              <S.CompanyInfo>
                <span className="name">{company}</span>
                <span className="date">{createdAt}</span>
              </S.CompanyInfo>
            </S.Header>

            <S.InfoList>
              <S.InfoRow>
                <S.Label>급여</S.Label>
                <S.Value>
                  <S.Badge>{wageType === 'DAILY' ? '일급' : wageType === 'HOURLY' ? '시급' : '월급'}</S.Badge>
                  <strong>{wage.toLocaleString()}원</strong>
                  {urgentEnabled && urgentWageIncrease != null && (
                    <S.UrgentHint>급구 · 마감 전 +{urgentWageIncrease.toLocaleString()}원 예정</S.UrgentHint>
                  )}
                </S.Value>
                <S.Label>공고 마감</S.Label>
                <S.Value>{deadline} <span className="dday">{calculateDDay(deadline)}</span></S.Value>
              </S.InfoRow>

              <S.InfoRow>
                <S.Label>근무 일시</S.Label>
                <S.Value><Calendar size={18} />{workDate}</S.Value>
                <S.Value><Clock size={18} />{workStart} ~ {workEnd}</S.Value>
              </S.InfoRow>
            </S.InfoList>
          </S.TextContent>

          <S.ImageWrapper>
            <ResizedImage
              src={companyLogoUrl}
              variant="detail-lg"
              alt={`${company} 로고`}
            />
          </S.ImageWrapper>
        </S.TopRow>

        {/* 하단 영역: 프로그레스바 + 액션 버튼 */}
        <S.FooterRow>
          <S.ProgressWrapper>
            <div className="status">지원 현황</div>
            <ProgressBar total={totalSlots} current={filledSlots} />
          </S.ProgressWrapper>

          {actions && <S.ActionWrapper>{actions}</S.ActionWrapper>}
        </S.FooterRow>
      </S.Container>
    </Section>
  );
};

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  TopRow: styled.div`
    display: flex;
    justify-content: space-between;
    gap: 40px;
    @media (max-width: 768px) { flex-direction: column-reverse; }
  `,
  TextContent: styled.div`
    flex: 1;
  `,
  CompanyInfo: styled.div`
    display: flex;
    gap: 12px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  Header: styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 32px;
    gap: 8px;
  `,
  TitleRow: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  `,
  TitleGroup: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  `,
  MainTitle: styled.h1`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    line-height: 1.4;
  `,
  UrgentHint: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.error};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  HeaderActions: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  `,
  InfoList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  InfoRow: styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 24px;
  `,
  Label: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.color.subText};
    width: 60px;
  `,
  Value: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    .dday { color: ${({ theme }) => theme.color.error}; font-weight: bold; }
  `,
  Badge: styled.span`
    padding: 2px 8px;
    background: ${({ theme }) => theme.color.secondary};
    color: ${({ theme }) => theme.color.primary};
    border-radius: 4px;
    font-size: 12px;
  `,
  ImageWrapper: styled.div`
    width: 300px;
    min-width: 300px;
    height: 200px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }

    @media (max-width: 768px) {
      width: 100%;
      min-width: unset;
    }
  `,
  FooterRow: styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  `,
  ProgressWrapper: styled.div`
    flex: 1;
    .status { margin-bottom: 8px; font-size: 14px; }
  `,
  ActionWrapper: styled.div`
    width: 300px;
    min-width: 300px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    @media (max-width: 768px) {
      width: 100%;
      min-width: unset;
    }
  `,
};
