import { useState } from 'react';
import { UserRoundPlus } from 'lucide-react';
import {
  getApplicationMutationErrorMessage,
  useOfferJobPost,
} from 'entities/application/model/hooks/useApplication';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  jobPostId: number;
  userId: number;
}

/** 고용주 채용 제안 (userId 필요) */
export const OfferJobButton = ({ jobPostId, userId }: Props) => {
  const { mutate, isPending } = useOfferJobPost(jobPostId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    mutate(userId, {
      onSuccess: () => {
        setIsModalOpen(false);
        alert('채용 제안이 전송되었습니다.');
      },
      onError: (error) => {
        alert(getApplicationMutationErrorMessage(error) ?? '제안 전송에 실패했습니다.');
      },
    });
  };

  return (
    <>
      <Button
        scheme="icon"
        buttonSize="small"
        borderRadius="medium"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        disabled={isPending}
      >
        <UserRoundPlus size={16} />
        제안
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={handleConfirm}
              disabled={isPending}
            >
              <UserRoundPlus size={16} />
              제안하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>고용 제안</h2>
          <p>선택한 공고로 채용 제안을 보내시겠습니까?</p>
        </ModalContent>
      </Modal>
    </>
  );
};
