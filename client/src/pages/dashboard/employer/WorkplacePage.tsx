import { useState } from 'react';
import styled from 'styled-components';
import { WorkplaceList } from 'widgets/workplace/WorkplaceList/ui/WorkplaceList';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import Button from 'shared/ui/Button/Button';

const WorkplacePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <S.PageWrapper>
      <S.PageHeader>
        <h1>작업장 목록</h1>
        <Button
          scheme="primary"
          buttonSize="small"
          fontSize="xsmall"
          borderRadius="medium"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + 작업장 추가
        </Button>
      </S.PageHeader>

      <WorkplaceList />

      <CreateWorkplaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
  PageHeader: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: ${({ theme }) => theme.fontSize.xlarge};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
    }
  `,
};

export default WorkplacePage;
