import Button from 'shared/ui/Button/Button';
import { Flag } from 'lucide-react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

/** 공고/이력서 오버뷰 등에 쓰는 신고 진입 버튼 */
export const ReportOverviewButton = ({ onClick, disabled }: Props) => (
  <Button
    type="button"
    scheme="secondary"
    buttonSize="small"
    borderRadius="medium"
    fontSize="xsmall"
    onClick={onClick}
    disabled={disabled}
  >
    <Flag size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} aria-hidden />
    신고
  </Button>
);
