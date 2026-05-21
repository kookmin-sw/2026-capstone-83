import { useLikeJobPost } from 'entities/jobPost/model/hooks/useLikeJobPost';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import LikeButton from './LikeButton';

interface Props {
  jobPostId: number;
  liked: boolean;
  variant?: 'icon' | 'bordered';
}

const LikeJobPostButton = ({ jobPostId, liked, variant = 'bordered' }: Props) => {
  const { mutate } = useLikeJobPost();
  const errorModal = useErrorAlertModal();

  return (
    <>
      <LikeButton
        liked={liked}
        onToggle={() =>
          mutate(jobPostId, {
            onError: errorModal.onMutationError('찜 처리에 실패했습니다.'),
          })
        }
        variant={variant}
      />
      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

export default LikeJobPostButton;
