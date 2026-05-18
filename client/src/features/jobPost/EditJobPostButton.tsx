import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from 'shared/ui/Button/Button';

interface Props {
  jobPostId: number;
  compact?: boolean;
}

const EditJobPostButton = ({ jobPostId, compact = false }: Props) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      scheme="secondary"
      buttonSize={compact ? 'xsmall' : 'small'}
      fontSize="xsmall"
      borderRadius="medium"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/jobpost/${jobPostId}/edit`);
      }}
    >
      {compact ? (
        <>
          <Pencil size={14} />
          수정
        </>
      ) : (
        '수정하기'
      )}
    </Button>
  );
};

export default EditJobPostButton;
