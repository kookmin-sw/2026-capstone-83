import { useState } from 'react';
import { Users } from 'lucide-react';
import Button from 'shared/ui/Button/Button';
import { BulkOfferModal } from './BulkOfferModal';

interface Props {
  jobPostId: number;
  disabled?: boolean;
}

/** 우선 대상 일괄 채용 제안 (반자동) */
export const BulkOfferButton = ({ jobPostId, disabled }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        scheme="secondary"
        buttonSize="small"
        fontSize="xsmall"
        borderRadius="medium"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Users size={14} style={{ marginRight: 4 }} />
        우선 대상 일괄 제안
      </Button>

      <BulkOfferModal jobPostId={jobPostId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
