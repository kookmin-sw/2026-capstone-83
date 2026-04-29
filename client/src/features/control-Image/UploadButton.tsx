import { Upload } from 'lucide-react';
import Button from 'shared/ui/Button/Button';

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerUpload: () => void;
}

export const ImageUploadButton = ({ fileInputRef, onChange, triggerUpload }: Props) => (
  <>
    <input
      type="file"
      ref={fileInputRef}
      onChange={onChange}
      accept="image/*"
      style={{ display: 'none' }}
    />
    <Button type="button" scheme="icon" buttonSize="small" onClick={triggerUpload}>
      <Upload size={20} />
    </Button>
  </>
);