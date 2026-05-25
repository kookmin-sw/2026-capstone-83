import Badge from 'shared/ui/Badge/Badge';

interface Props {
  urgentEnabled?: boolean;
}

export const UrgentJobPostBadge = ({ urgentEnabled }: Props) => {
  if (!urgentEnabled) return null;
  return (
    <Badge scheme="error" fontSize="xsmall">
      급구
    </Badge>
  );
};
