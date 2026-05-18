import Button from 'shared/ui/Button/Button';

interface Props {
  isPending?: boolean;
  style?: React.CSSProperties;
}

const UpdateJobPostButton = ({ isPending = false, style }: Props) => {
  return (
    <Button
      type="submit"
      scheme="primary"
      buttonSize="smallMedium"
      style={{ width: '100%', ...style }}
      disabled={isPending}
    >
      {isPending ? '저장 중...' : '수정 완료'}
    </Button>
  );
};

export default UpdateJobPostButton;
