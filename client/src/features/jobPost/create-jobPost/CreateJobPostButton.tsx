
import Button from 'shared/ui/Button/Button';

interface CreateJobPostButtonProps {
  style?: React.CSSProperties;
}

const CreateJobPostButton = ({ style }: CreateJobPostButtonProps) => {
  return (
    <Button
      type="submit"
      scheme="primary"
      buttonSize="smallMedium"
      style={{ width: '100%', ...style }}
    >
      + 공고 등록
    </Button>
  );
};

export default CreateJobPostButton;
