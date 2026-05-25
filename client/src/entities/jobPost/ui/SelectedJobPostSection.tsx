import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { JobPostOwnerActions } from 'features/jobPost/JobPostOwnerActions';
import { useJobPost } from '../model/hooks/useJobPost';
import { RECRUITMENT_STATUS_MAP } from '../model/constants';
import Section from 'shared/ui/Layout/Section';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import Badge from 'shared/ui/Badge/Badge';
import { UrgentJobPostBadge } from './UrgentJobPostBadge';
import { BulkOfferButton } from 'features/offer/BulkOfferButton';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  postId: number;
}

const SelectedJobPostSection = ({ postId }: Props) => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);
  const { data: jobPost, isLoading } = useJobPost(postId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) return <Loading message="공고 정보를 불러오는 중..." />;
  if (!jobPost) return null;

  const wageLabel = jobPost.wageType === 'DAILY' ? '일급' : jobPost.wageType === 'HOURLY' ? '시급' : '월급';
  const recruitmentBadge = RECRUITMENT_STATUS_MAP[jobPost.status];
  const description = jobPost.description || '';
  const shouldTruncate = description.length > 100;
  const displayDescription = isExpanded ? description : description.slice(0, 100);

  return (
    <Section>
      <S.Container>
        {/* 타이틀(상세 링크) + 수정/삭제 */}
        <S.TitleRow>
          <S.TitleLink
            type="button"
            onClick={() => navigate(`/jobpost/${postId}`)}
            aria-label={`${jobPost.title} 공고 상세 보기`}
          >
            <S.Title>{jobPost.title}</S.Title>
            <UrgentJobPostBadge urgentEnabled={jobPost.urgentEnabled} />
            <ArrowRight size={16} aria-hidden />
          </S.TitleLink>
          {role === 'EMPLOYER' && (
            <JobPostOwnerActions
              jobPostId={postId}
              status={jobPost.status}
              onDeleted={() => setSelectedJobPostId(null)}
            />
          )}
        </S.TitleRow>

        {/* 프로그레스바 */}
        <S.ProgressSection>
          <S.ProgressHeader>
            <S.ProgressLabel>모집 현황</S.ProgressLabel>
            <Badge scheme={recruitmentBadge.scheme} fontSize="xsmall">
              {recruitmentBadge.label}
            </Badge>
          </S.ProgressHeader>
          <ProgressBar total={jobPost.totalSlots} current={jobPost.filledSlots} />
          {jobPost.status === 'CLOSED' && (
            <S.StatusHint>마감된 공고입니다. 신규 지원·제안은 받을 수 없습니다.</S.StatusHint>
          )}
          {role === 'EMPLOYER' && jobPost.status === 'OPEN' && (
            <BulkOfferButton jobPostId={postId} />
          )}
        </S.ProgressSection>

        {/* 정보 영역 */}
        <S.InfoGrid>
          <S.InfoRow>
            <S.InfoLabel>급여</S.InfoLabel>
            <S.InfoValue>
              <Badge scheme="primary" fontSize="xsmall">{wageLabel}</Badge>
              <span className="wage">{jobPost.wage.toLocaleString()}원</span>
            </S.InfoValue>
          </S.InfoRow>

          <S.InfoRow>
            <S.InfoLabel>근무 일시</S.InfoLabel>
            <S.InfoValue>
              <Calendar size={16} />
              <span>{jobPost.workDate}</span>
              <Clock size={16} />
              <span>{jobPost.workStart} ~ {jobPost.workEnd}</span>
            </S.InfoValue>
          </S.InfoRow>

          <S.InfoRow>
            <S.InfoLabel>근무지</S.InfoLabel>
            <S.InfoValue>
              <MapPin size={16} />
              <span>{jobPost.location}</span>
            </S.InfoValue>
          </S.InfoRow>
        </S.InfoGrid>

        {/* 작업 상세 정보 */}
        {description && (
          <S.DescriptionSection>
            <S.DescriptionTitle>작업 상세 정보</S.DescriptionTitle>
            <S.DescriptionContent>
              {displayDescription}
              {shouldTruncate && !isExpanded && '...'}
            </S.DescriptionContent>
            {shouldTruncate && (
              <S.ExpandButton onClick={() => setIsExpanded((prev) => !prev)}>
                {isExpanded ? '접기' : '더보기'}
              </S.ExpandButton>
            )}
          </S.DescriptionSection>
        )}
      </S.Container>
    </Section>
  );
};

export default SelectedJobPostSection;

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  TitleRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  `,
  TitleLink: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;

    &:hover {
      opacity: 0.85;
    }

    svg {
      flex-shrink: 0;
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  Title: styled.span`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  ProgressSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ProgressHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  ProgressLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  StatusHint: styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
  InfoGrid: styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,
  InfoRow: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  InfoLabel: styled.span`
    min-width: 64px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  InfoValue: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};

    .wage {
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
    }

    svg {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  DescriptionSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
  DescriptionTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  DescriptionContent: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.thirdText};
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  `,
  ExpandButton: styled.button`
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.primary};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  `,
};
