import styled from 'styled-components';
import type { PostStatus } from 'entities/jobPost/model/types/jobPost.type';
import EditJobPostButton from './EditJobPostButton';
import DeleteJobPostButton from './DeleteJobPostButton';
import CloseJobPostButton from './CloseJobPostButton';

interface Props {
  jobPostId: number;
  status?: PostStatus;
  compact?: boolean;
  onDeleted?: () => void;
  onClosed?: () => void;
}

export const JobPostOwnerActions = ({
  jobPostId,
  status,
  compact = true,
  onDeleted,
  onClosed,
}: Props) => {
  return (
    <S.Row onClick={(e) => e.stopPropagation()}>
      {status && (
        <CloseJobPostButton
          jobPostId={jobPostId}
          status={status}
          compact={compact}
          onClosed={onClosed}
        />
      )}
      <EditJobPostButton jobPostId={jobPostId} compact={compact} />
      <DeleteJobPostButton jobPostId={jobPostId} compact={compact} onDeleted={onDeleted} />
    </S.Row>
  );
};

const S = {
  Row: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    flex-shrink: 0;
    max-width: 100%;
  `,
};
