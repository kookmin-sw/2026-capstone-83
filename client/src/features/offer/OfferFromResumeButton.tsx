import { useState } from 'react';
import { UserRoundPlus } from 'lucide-react';
import styled from 'styled-components';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useOfferJobPostToApplicant } from 'entities/application/model/hooks/useApplication';
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { OfferableJobPostSelectModal } from './OfferableJobPostSelectModal';

interface Props {
  userId: number;
  applicantName?: string;
  /** 카드/목록에서 클릭 전파 방지 */
  stopPropagation?: boolean;
  buttonSize?: 'medium' | 'small';
  /** 이력서 개요: 사진 아래 전체 너비 다크 버튼 */
  variant?: 'default' | 'profile';
}

/** 이력서에서 고용 제안 — 공고 선택 모달 → offer API */
export const OfferFromResumeButton = ({
  userId,
  applicantName,
  stopPropagation = false,
  buttonSize = 'medium',
  variant = 'default',
}: Props) => {
  const role = useAuthStore((s) => s.role);
  const [isListOpen, setIsListOpen] = useState(false);
  const { mutate, isPending } = useOfferJobPostToApplicant();
  const errorModal = useErrorAlertModal();

  if (role !== 'EMPLOYER') return null;

  const handleOpen = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsListOpen(true);
  };

  const handleSelect = (post: JobPost) => {
    mutate(
      { jobPostId: post.id, userId },
      {
        onSuccess: () => {
          setIsListOpen(false);
          alert(`[${post.title}] 채용 제안이 전송되었습니다.`);
        },
        onError: errorModal.onMutationError('채용 제안에 실패했습니다.'),
      },
    );
  };

  const label = isPending ? '제안 중...' : '고용 제안';

  return (
    <>
      {variant === 'profile' ? (
        <S.ProfileOfferButton type="button" onClick={handleOpen} disabled={isPending}>
          <UserRoundPlus size={18} />
          {label}
        </S.ProfileOfferButton>
      ) : (
        <Button
          scheme="primary"
          buttonSize={buttonSize}
          onClick={handleOpen}
          disabled={isPending}
          style={{ whiteSpace: 'nowrap' }}
        >
          <UserRoundPlus size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
          {label}
        </Button>
      )}

      <OfferableJobPostSelectModal
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        applicantUserId={userId}
        applicantName={applicantName}
        onSelect={handleSelect}
        isOffering={isPending}
      />

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const S = {
  ProfileOfferButton: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.white};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    box-shadow: ${({ theme }) => theme.shadow.default};
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
};
