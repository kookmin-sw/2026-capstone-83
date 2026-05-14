import styled from 'styled-components';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { ApplicantCalendarWidget } from 'widgets/calendar/ApplicantCalendar/ui/ApplicantCalendarWidget';
import SelectedJobPostSection from 'entities/jobPost/ui/SelectedJobPostSection';

const WorkerDashBoardPage = () => {
  const selectedJobPostId = useScheduleStore((s) => s.selectedJobPostId);

  return (
    <S.PageWrapper>
      {/* 캘린더 */}
      <ApplicantCalendarWidget />

      {/* 선택된 공고 정보 */}
      {selectedJobPostId !== null && (
        <>
          <S.SectionLabel>공고 정보</S.SectionLabel>
          <SelectedJobPostSection postId={selectedJobPostId} />
        </>
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
  SectionLabel: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
};

export default WorkerDashBoardPage;
