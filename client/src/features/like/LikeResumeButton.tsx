import { useLikeResume } from 'entities/resume/model/hooks/useLikeResume';
import LikeButton from './LikeButton';

interface Props {
  resumeId: number;
  liked: boolean;
  variant?: 'icon' | 'bordered';
}

const LikeResumeButton = ({ resumeId, liked, variant = 'bordered' }: Props) => {
  const { mutate } = useLikeResume();

  return (
    <LikeButton
      liked={liked}
      onToggle={() => mutate(resumeId)}
      variant={variant}
    />
  );
};

export default LikeResumeButton;
