import type { ReactNode } from 'react';
import Badge from 'shared/ui/Badge/Badge';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import * as S from './JobPost.styled';
import type { JobPost } from '../model/types/jobPost.type';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateDDay } from 'shared/lib/calculateDDay';
import { useTheme } from 'styled-components';
import {
  formatScheduleLine,
  getApplicationBadge,
  getDDayTone,
  getRecruitmentBadge,
  getSlotsRemainingLabel,
  getWageTypeLabel,
} from '../lib/jobPostCardDisplay';

export interface JobPostCardProps {
  data: JobPost;
  /** true: 로고 열 포함 레이아웃 (URL 없으면 이니셜 플레이스홀더) */
  showLogo?: boolean;
  extraActions?: ReactNode;
  /** 카드 우상단(제목 행) 액션 — 지원/채용 버튼 등 */
  headerActions?: ReactNode;
  /** @deprecated headerActions 사용 */
  bottomActions?: ReactNode;
}

export const JobPostCard = ({
  data,
  showLogo = false,
  extraActions,
  headerActions,
  bottomActions,
}: JobPostCardProps) => {
  const topActions = headerActions ?? bottomActions;
  const theme = useTheme();
  const {
    id,
    title,
    company,
    companyLogoUrl,
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
    filledSlots,
  } = data;

  const dDayLabel = calculateDDay(deadline);
  const dDayTone = getDDayTone(dDayLabel);
  const recruitBadge = getRecruitmentBadge(status, applyStatus);
  const applyBadge = getApplicationBadge(
    applyStatus,
    'applicationStatus' in data ? data.applicationStatus : undefined,
  );
  const logoUrl = showLogo ? companyLogoUrl : undefined;
  const companyInitial = company.trim().charAt(0) || '?';

  return (
    <S.CardOuter>
      <Link to={`/jobpost/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <S.CardContainer>
        <S.TopRow $withLogo={showLogo}>
          {showLogo && (
            <S.LogoBox>
              {logoUrl ? (
                <img src={logoUrl} alt="" />
              ) : (
                <S.LogoFallback aria-hidden>{companyInitial}</S.LogoFallback>
              )}
            </S.LogoBox>
          )}

          <S.MainColumn>
            <S.MetaRow>
              <S.Company>{company}</S.Company>
              {extraActions && (
                <S.ActionGroup onClick={(e) => e.preventDefault()}>{extraActions}</S.ActionGroup>
              )}
            </S.MetaRow>

            <S.TitleRow>
              <S.TitleGroup>
                <S.Title>{title}</S.Title>
                <S.DDayChip $tone={dDayTone}>{dDayLabel}</S.DDayChip>
              </S.TitleGroup>
              {topActions && (
                <S.ActionGroup onClick={(e) => e.preventDefault()}>{topActions}</S.ActionGroup>
              )}
            </S.TitleRow>
          </S.MainColumn>
        </S.TopRow>

        <S.PayLine>
          <strong>
            {getWageTypeLabel(wageType)} {wage.toLocaleString()}원
          </strong>
          <span className="dot">·</span>
          {formatScheduleLine(workDate, workStart, workEnd)}
        </S.PayLine>

        <S.LocationLine>
          <S.Icon>
            <MapPin size={14} strokeWidth={2} color={theme.color.subText} aria-hidden />
          </S.Icon>
          <span>{location}</span>
        </S.LocationLine>

        <S.FooterRow>
          <S.ProgressWrap>
            <ProgressBar total={totalSlots} current={filledSlots} height="8px" fontSize="12px" />
          </S.ProgressWrap>
          <S.SlotsHint>{getSlotsRemainingLabel(totalSlots, filledSlots)}</S.SlotsHint>
          {(recruitBadge || applyBadge) && (
            <S.BadgeGroup>
              {recruitBadge && <Badge scheme={recruitBadge.scheme}>{recruitBadge.label}</Badge>}
              {applyBadge && <Badge scheme={applyBadge.scheme}>{applyBadge.label}</Badge>}
            </S.BadgeGroup>
          )}
        </S.FooterRow>

        </S.CardContainer>
      </Link>
    </S.CardOuter>
  );
};
