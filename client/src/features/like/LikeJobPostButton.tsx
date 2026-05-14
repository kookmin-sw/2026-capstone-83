import { useLikeJobPost } from 'entities/jobPost/model/hooks/useLikeJobPost';
import LikeButton from './LikeButton';

interface Props {
  jobPostId: number;
  liked: boolean;
  variant?: 'icon' | 'bordered';
}

const LikeJobPostButton = ({ jobPostId, liked, variant = 'bordered' }: Props) => {
  const { mutate } = useLikeJobPost();

  return (
    <LikeButton
      liked={liked}
      onToggle={() => mutate(jobPostId)}
      variant={variant}
    />
  );
};

export default LikeJobPostButton;
