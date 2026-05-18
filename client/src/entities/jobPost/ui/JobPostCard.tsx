import React from 'react';
import Badge from 'shared/ui/Badge/Badge';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import * as S from './JobPost.styled';
import type { JobPost } from '../model/types/jobPost.type';
import { Banknote, Calendar, Clock, MapPin } from 'lucide-react';
import { APPLICATION_STATUS_MAP, RECRUITMENT_STATUS_MAP } from '../model/constants';
import { Link } from 'react-router-dom';
import { calculateDDay } from 'shared/lib/calculateDDay';

interface JobPostCardProps {
  data: JobPost;
  /** 우측 상단 기능 버튼들을 위한 슬롯 (LikeButton 등) */
  extraActions?: React.ReactNode;
  /** 카드 하단 액션 슬롯 (승인/거절 버튼 등) */
  bottomActions?: React.ReactNode;
}

const INFO_ICON_SIZE = 15;

export const JobPostCard = ({ data, extraActions, bottomActions }: JobPostCardProps) => {
  const {
    id,
    title,
    company,
    deadline,
    status,
    applyStatus,
    wage,
    wageType,
    location,
    workStart,
    workEnd,
    workDate,
    totalSlots,
    filledSlots
  } = data;

  const recruitInfo = RECRUITMENT_STATUS_MAP[status];
  const applyInfo = APPLICATION_STATUS_MAP[applyStatus];



  return (
    <Link to={`/jobpost/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <S.CardContainer>

        <S.Header>
          <S.BadgeGroup>
            {/* 공고 상태 뱃지 */}
            {recruitInfo && (
              <Badge scheme={recruitInfo.scheme}>
                {recruitInfo.label}
              </Badge>
            )}

            {/* 지원 상태 뱃지 (applyInfo가 존재할 때만 렌더링) */}
            {applyInfo && (
              <Badge scheme={applyInfo.scheme}>
                {applyInfo.label}
              </Badge>
            )}
          </S.BadgeGroup>
          <S.ActionGroup>
            {extraActions}
          </S.ActionGroup>
        </S.Header>

        {/* 2. 중단: 타이틀 및 D-Day */}
        <S.TitleSection>
          <S.Title>{title}</S.Title>
          <S.DDay>{calculateDDay(deadline)}</S.DDay>
        </S.TitleSection>
        <S.Company>{company}</S.Company>

        {/* 3. 하단: 상세 정보 (Grid 레이아웃) */}
        <S.InfoGrid>
          <S.InfoItem>
            <S.Icon><Banknote size={INFO_ICON_SIZE} /></S.Icon>
            <span>
              {wageType === 'DAILY' ? '일급' : '시급'} <strong>{wage.toLocaleString()}원</strong>
            </span>
          </S.InfoItem>
          <S.InfoItem>
            <S.Icon><Calendar size={INFO_ICON_SIZE} /></S.Icon>
            <span>{workDate}</span>
          </S.InfoItem>
          <S.InfoItem>
            <S.Icon><MapPin size={INFO_ICON_SIZE} /></S.Icon>
            <span>{location}</span>
          </S.InfoItem>
          <S.InfoItem>
            <S.Icon><Clock size={INFO_ICON_SIZE} /></S.Icon>
            <span>{workStart} - {workEnd}</span>
          </S.InfoItem>
        </S.InfoGrid>

        {/* 4. 최하단: 모집 현황 프로그레스 바 */}
        <S.ProgressSection>
          <ProgressBar
            total={totalSlots}
            current={filledSlots}
            height="10px"
            fontSize="14px"
          />
        </S.ProgressSection>

        {/* 5. 하단 액션 (있을 때만) */}
        {bottomActions && (
          <S.BottomActions onClick={(e) => e.preventDefault()}>
            {bottomActions}
          </S.BottomActions>
        )}

      </S.CardContainer>
    </Link>
  );
};