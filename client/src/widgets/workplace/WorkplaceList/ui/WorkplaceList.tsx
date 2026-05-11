import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMockWorkplaces } from 'entities/workplace/api/workplace.api';
import type { Workplace } from 'entities/workplace/model/types/workplace.type';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { WorkplaceCard } from 'entities/workplace/ui/WorkplaceCard';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import EditWorkplaceButton from 'features/workplace/EditWorkplaceButton';
import DeleteWorkplaceButton from 'features/workplace/DeleteWorkplaceButton';
import Loading from 'shared/ui/Loading/Loading';

export const WorkplaceList = () => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedId = useWorkplaceStore((s) => s.selectedWorkplaceId);
  const setSelectedId = useWorkplaceStore((s) => s.setSelectedWorkplaceId);

  useEffect(() => {
    fetchMockWorkplaces().then((data) => {
      setWorkplaces(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Loading message="작업장 목록을 불러오는 중..." />;

  return (
    <>
      <S.CardList>
        {workplaces.map((wp) => (
          <WorkplaceCard
            key={wp.id}
            data={wp}
            isActive={selectedId === wp.id}
            onClick={() => setSelectedId(selectedId === wp.id ? null : wp.id)}
            actions={
              <>
                <EditWorkplaceButton />
                <DeleteWorkplaceButton workplaceId={wp.id} />
              </>
            }
          />
        ))}

        <S.AddCard onClick={() => setIsCreateModalOpen(true)}>
          + 작업장 추가
        </S.AddCard>
      </S.CardList>

      <CreateWorkplaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

const S = {
  CardList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  AddCard: styled.button`
    width: 100%;
    padding: 20px 24px;
    min-height: 190px;
    border: 2px dashed ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.medium};
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
};
