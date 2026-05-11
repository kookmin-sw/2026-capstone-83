import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMockWorkplaces } from 'entities/workplace/api/workplace.api';
import type { Workplace } from 'entities/workplace/model/types/workplace.type';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { WorkplaceFilterBar } from 'features/workplace/WorkplaceFilterBar';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import { WorkplaceInfoSection } from 'entities/workplace/ui/WorkplaceInfoSection';
import Button from 'shared/ui/Button/Button';
import Loading from 'shared/ui/Loading/Loading';

const EmployerDashboardPage = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedId = useWorkplaceStore((s) => s.selectedWorkplaceId);
  const setSelectedId = useWorkplaceStore((s) => s.setSelectedWorkplaceId);

  useEffect(() => {
    fetchMockWorkplaces().then((data) => {
      setWorkplaces(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loading message="작업장 정보를 불러오는 중..." />;

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
            <Button scheme="secondary" buttonSize="small" fontSize='small' onClick={() => setIsEditModalOpen(true)}>
              수정
            </Button>
          }
        />
      )}

      {/* 대시보드 콘텐츠 영역 (추후 확장) */}
      <S.DashboardContent>
        <h2>대시보드</h2>
        <p>
          {selectedId
            ? `"${selectedWorkplace?.name}" 작업장의 정보를 표시합니다.`
            : '전체 작업장의 정보를 표시합니다.'}
        </p>
      </S.DashboardContent>

      {/* 작업장 생성 모달 */}
      <CreateWorkplaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* 작업장 수정 모달 */}
      <CreateWorkplaceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
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
  DashboardContent: styled.div`
    padding: 32px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};

    h2 {
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      margin-bottom: 8px;
    }
    p {
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.color.subText};
    }
  `,
};

export default EmployerDashboardPage;
