import { X } from 'lucide-react';
import Button from 'shared/ui/Button/Button';

interface Props {
  onDelete: () => void;
}

export const ImageRemoveButton = ({ onDelete }: Props) => (
  <Button type="button" scheme="icon" buttonSize="small" onClick={onDelete}>
    <X size={20} />
  </Button>
);