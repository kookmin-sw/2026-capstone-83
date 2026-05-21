import { useLikeResume } from 'entities/resume/model/hooks/useLikeResume';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import LikeButton from './LikeButton';

interface Props {
  resumeId: number;
  liked: boolean;
  variant?: 'icon' | 'bordered';
}

const LikeResumeButton = ({ resumeId, liked, variant = 'bordered' }: Props) => {
  const { mutate } = useLikeResume();
  const errorModal = useErrorAlertModal();

  return (
    <>
      <LikeButton
        liked={liked}
        onToggle={() =>
          mutate(resumeId, {
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

export default LikeResumeButton;
