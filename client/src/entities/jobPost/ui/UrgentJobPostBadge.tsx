import { isUrgentEnabled } from '../lib/urgentJobPost';
import Badge from 'shared/ui/Badge/Badge';

interface Props {
  urgentEnabled?: boolean | null;
}

export const UrgentJobPostBadge = ({ urgentEnabled }: Props) => {
  if (!isUrgentEnabled(urgentEnabled)) return null;
  return (
    <Badge scheme="error" fontSize="xsmall">
      급구
    </Badge>
  );
};
