import { X } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useRejectApplicant } from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 지원자 거절 버튼 */
export const RejectApplicantButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useRejectApplicant(jobPostId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    mutate(applicationId);
  };

  return (
    <Button
      scheme="secondary"
      buttonSize="small"
      fontSize="xsmall"
      borderRadius="medium"
      onClick={handleClick}
      disabled={isPending}
    >
      <X size={14} color={theme.color.error} />
      거절
    </Button>
  );
};
