import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { JobPostOwnerActions } from 'features/jobPost/JobPostOwnerActions';
import { useJobPost } from '../model/hooks/useJobPost';
import Section from 'shared/ui/Layout/Section';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  postId: number;
}

const SelectedJobPostSection = ({ postId }: Props) => {
  const navigate = useNavigate();
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);
  const { data: jobPost, isLoading } = useJobPost(postId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) return <Loading message="공고 정보를 불러오는 중..." />;
  if (!jobPost) return null;

  const wageLabel = jobPost.wageType === 'DAILY' ? '일급' : jobPost.wageType === 'HOURLY' ? '시급' : '월급';
  const description = jobPost.description || '';
  const shouldTruncate = description.length > 100;
  const displayDescription = isExpanded ? description : description.slice(0, 100);

  return (
    <Section>
      <S.Container>
        {/* 타이틀(상세 링크) + 수정/삭제 */}
        <S.TitleRow>
          <S.TitleLink onClick={() => navigate(`/jobpost/${postId}`)}>
            <S.Title>{jobPost.title}</S.Title>
            <S.ArrowButton>
              <ArrowRight size={20} />
            </S.ArrowButton>
          </S.TitleLink>
          <JobPostOwnerActions
            jobPostId={postId}
            onDeleted={() => setSelectedJobPostId(null)}
          />
        </S.TitleRow>

        {/* 프로그레스바 */}
        <S.ProgressSection>
          <S.ProgressLabel>모집 현황</S.ProgressLabel>
          <ProgressBar total={jobPost.totalSlots} current={jobPost.filledSlots} />
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
    gap: 12px;
  `,
  TitleLink: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-width: 0;
    gap: 8px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `,
  Title: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  ArrowButton: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: ${({ theme }) => theme.color.subText};
  `,
  ProgressSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ProgressLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
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
