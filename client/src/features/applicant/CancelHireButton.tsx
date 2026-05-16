import { Undo2 } from 'lucide-react';
import { useTheme } from 'styled-components';
import Button from 'shared/ui/Button/Button';

interface Props {
  applicationId: number;
  jobPostId: number;
}

/** 채용 취소 버튼 (API 미구현 — 껍데기) */
export const CancelHireButton = ({ applicationId, jobPostId }: Props) => {
  const theme = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 채용 취소 API 연결
    alert(`채용 취소 요청 (applicationId: ${applicationId}, jobPostId: ${jobPostId})`);
  };

  return (
    <Button
      scheme="secondary"
      buttonSize="small"
      fontSize="xsmall"
      borderRadius="medium"
      onClick={handleClick}
    >
      <Undo2 size={14} color={theme.color.error} />
      채용 취소
    </Button>
  );
};
