import styled from 'styled-components';
import EditJobPostButton from './EditJobPostButton';
import DeleteJobPostButton from './DeleteJobPostButton';

interface Props {
  jobPostId: number;
  compact?: boolean;
  onDeleted?: () => void;
}

export const JobPostOwnerActions = ({ jobPostId, compact = true, onDeleted }: Props) => {
  return (
    <S.Row onClick={(e) => e.stopPropagation()}>
      <EditJobPostButton jobPostId={jobPostId} compact={compact} />
      <DeleteJobPostButton jobPostId={jobPostId} compact={compact} onDeleted={onDeleted} />
    </S.Row>
  );
};

const S = {
  Row: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  `,
};
