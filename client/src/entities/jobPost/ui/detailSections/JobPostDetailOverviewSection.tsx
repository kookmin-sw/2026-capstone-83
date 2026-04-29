import styled from 'styled-components';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { Banknote, Calendar, Clock, MapPin } from 'lucide-react';

import Section from 'shared/ui/Layout/Section';
import { calculateDDay } from 'shared/lib/calculateDDay';
import type { JobPostOverviewProps } from '../../model/types/jobPost.type';
import { Header } from '../JobPost.styled';

interface Props {
  data: JobPostOverviewProps | null; // 공고 개요 정보 (로딩 상태를 위해 null 허용)
  actions?: React.ReactNode; // 하단 지원하기/좋아요 버튼 슬롯
}

export const JobPostDetailOverviewSection = ({ data, actions }: Props) => {

  if (!data) {
    return <div>로딩 중...</div>; // 또는 null
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
    filledSlots
  } = data;

  return (
    <Section>
      <S.OverviewLayout>
        <S.TextContent>

          <S.Header>
            <S.MainTitle>{title}</S.MainTitle>

            <S.CompanyInfo>
              <span className="name">{company}</span>
              <span className="date">{createdAt}</span>
            </S.CompanyInfo>
          </S.Header>



          <S.InfoList>
            <S.InfoRow>
              <S.Label>급여</S.Label>
              <S.Value>
                <S.Badge>{wageType === 'DAILY' ? '일급' : '시급'}</S.Badge>
                <strong>{wage.toLocaleString()}원</strong>
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

          <S.ProgressWrapper>
            <div className="status">
              지원 현황
            </div>
            <ProgressBar total={totalSlots} current={filledSlots} />
          </S.ProgressWrapper>
        </S.TextContent>

        <S.ImageWrapper>
          <img src={companyLogoUrl || "https://picsum.photos/400/300"} alt="공고 이미지" />
        </S.ImageWrapper>
      </S.OverviewLayout>

      {actions && <S.ActionWrapper>{actions}</S.ActionWrapper>}
    </Section>
  );
};

const S = {
  OverviewLayout: styled.div`
    display: flex;
    justify-content: space-between;
    gap: 40px;
    @media (max-width: 768px) { flex-direction: column-reverse; }
  `,
  TextContent: styled.div` flex: 1; `,
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

  MainTitle: styled.h1`
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    line-height: 1.4;
  `,
  InfoList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
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
  ProgressWrapper: styled.div`
    .status { margin-bottom: 8px; font-size: 14px; strong { color: ${({ theme }) => theme.color.primary}; } }
  `,
  ImageWrapper: styled.div`
    width: 300px;
    height: 200px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  `,
  ActionWrapper: styled.div`
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  `
};