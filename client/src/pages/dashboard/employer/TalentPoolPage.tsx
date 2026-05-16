import styled from 'styled-components';
import { useWorkplaces } from 'entities/workplace/model/hooks/useWorkplace';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { useJobPost } from 'entities/jobPost/model/hooks/useJobPost';
import { ApplicantListByStatus } from 'widgets/applicant/ApplicantListByStatus';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { MapPin, Calendar, Clock, Building2 } from 'lucide-react';

const TalentPoolPage = () => {
  const { data: workplaces, isLoading: wpLoading } = useWorkplaces();
  const selectedWpId = useWorkplaceStore((s) => s.selectedWorkplaceId);
  const selectedJobPostId = useScheduleStore((s) => s.selectedJobPostId);

  const { data: jobPost, isLoading: jpLoading } = useJobPost(selectedJobPostId ?? 0);

  if (wpLoading) return <Loading message="정보를 불러오는 중..." />;

  const selectedWorkplace = selectedWpId && workplaces
    ? workplaces.find((wp) => wp.id === selectedWpId) || null
    : null;

  return (
    <S.PageWrapper>
      {/* 상단: 작업장 + 공고 카드 한 줄 */}
      <S.TopRow>
        {/* 작업장 카드 */}
        <S.InfoCard>
          <S.CardIcon>
            <Building2 size={20} />
          </S.CardIcon>
          <S.CardContent>
            <S.CardLabel>선택된 작업장</S.CardLabel>
            {selectedWorkplace ? (
              <>
                <S.CardTitle>{selectedWorkplace.name}</S.CardTitle>
                <S.CardMeta>{selectedWorkplace.companyName} · {selectedWorkplace.address}</S.CardMeta>
              </>
            ) : (
              <S.CardMeta>대시보드에서 작업장을 선택해주세요</S.CardMeta>
            )}
          </S.CardContent>
        </S.InfoCard>

        {/* 공고 카드 */}
        <S.InfoCard>
          <S.CardIcon>
            <Calendar size={20} />
          </S.CardIcon>
          <S.CardContent>
            <S.CardLabel>선택된 공고</S.CardLabel>
            {jpLoading ? (
              <S.CardMeta>불러오는 중...</S.CardMeta>
            ) : jobPost ? (
              <>
                <S.CardTitle>{jobPost.title}</S.CardTitle>
                <S.CardMetaRow>
                  <S.CardMeta><MapPin size={12} /> {jobPost.location}</S.CardMeta>
                  <S.CardMeta><Clock size={12} /> {jobPost.workStart} - {jobPost.workEnd}</S.CardMeta>
                </S.CardMetaRow>
                <S.ProgressRow>
                  <ProgressBar total={jobPost.totalSlots} current={jobPost.filledSlots} />
                </S.ProgressRow>
              </>
            ) : (
              <S.CardMeta>대시보드 캘린더에서 공고를 선택해주세요</S.CardMeta>
            )}
          </S.CardContent>
        </S.InfoCard>
      </S.TopRow>

      {/* 지원자 목록 */}
      {selectedJobPostId !== null ? (
        <S.ApplicantSection>
          <S.SectionLabel>지원자 목록</S.SectionLabel>
          <ApplicantListByStatus jobPostId={selectedJobPostId} />
        </S.ApplicantSection>
      ) : (
        <Section>
          <S.EmptyMessage>캘린더에서 공고를 선택하면 지원자 목록이 표시됩니다.</S.EmptyMessage>
        </Section>
      )}
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  TopRow: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `,
  InfoCard: styled.div`
    display: flex;
    gap: 16px;
    padding: 24px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  CardIcon: styled.div`
    display: flex;
    align-items: flex-start;
    padding-top: 2px;
    color: ${({ theme }) => theme.color.primary};
    flex-shrink: 0;
  `,
  CardContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  `,
  CardLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  CardTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  CardMeta: styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  CardMetaRow: styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `,
  ProgressRow: styled.div`
    margin-top: 8px;
  `,
  SectionLabel: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  ApplicantSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 32px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  EmptyMessage: styled.p`
    text-align: center;
    padding: 40px 20px;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
    margin: 0;
  `,
};

export default TalentPoolPage;
