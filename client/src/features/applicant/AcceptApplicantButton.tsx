import { Check } from 'lucide-react';
import { useTheme } from 'styled-components';
import { useAcceptApplicant } from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 지원자 채용 승인 버튼 */
export const AcceptApplicantButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();
  const { mutate, isPending } = useAcceptApplicant(jobPostId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    mutate(applicationId);
  };

  return (
    <Button
      scheme="primary"
      buttonSize="small"
      fontSize="xsmall"
      borderRadius="medium"
      onClick={handleClick}
      disabled={isPending}
    >
      <Check size={14} color={theme.color.white} />
      채용
    </Button>
  );
};
