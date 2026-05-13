import { useState } from 'react';
import styled from 'styled-components';
import { useWorkplaces } from 'entities/workplace/model/hooks/useWorkplace';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { WorkplaceFilterBar } from 'features/workplace/WorkplaceFilterBar';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import { WorkplaceInfoSection } from 'entities/workplace/ui/WorkplaceInfoSection';
import { EmployerCalendarWidget } from 'widgets/calendar/EmployerCalendar/ui/EmployerCalendarWidget';
import Button from 'shared/ui/Button/Button';
import Loading from 'shared/ui/Loading/Loading';

const EmployerDashboardPage = () => {
  const { data: workplaces, isLoading } = useWorkplaces();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedId = useWorkplaceStore((s) => s.selectedWorkplaceId);
  const setSelectedId = useWorkplaceStore((s) => s.setSelectedWorkplaceId);

  if (isLoading || !workplaces) return <Loading message="작업장 정보를 불러오는 중..." />;

  const selectedWorkplace = selectedId
    ? workplaces.find((wp) => wp.id === selectedId) || null
    : null;

  return (
    <S.PageWrapper>
      {/* 작업장 필터 바 */}
      <WorkplaceFilterBar
        workplaces={workplaces}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* 선택된 작업장 정보 (전체가 아닐 때만) */}
      {selectedWorkplace && (
        <WorkplaceInfoSection
          data={selectedWorkplace}
          actions={
            <Button scheme="secondary" buttonSize="small" fontSize="small" onClick={() => setIsEditModalOpen(true)}>
              수정
            </Button>
          }
        />
      )}

      {/* 대시보드 콘텐츠 영역 — 캘린더 */}
      <EmployerCalendarWidget />

      {/* 작업장 생성 모달 */}
      <CreateWorkplaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* 작업장 수정 모달 */}
      <CreateWorkplaceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={selectedWorkplace}
      />
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
};

export default EmployerDashboardPage;
