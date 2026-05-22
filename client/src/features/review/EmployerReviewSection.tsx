import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import {
  useWriteEmployerReview,
  useUpdateReview,
  useDeleteReview,
  useReviewsByApplication,
} from 'entities/review/model/hooks/useReview';
import {
  EMPLOYER_REVIEW_TAG_PAIRS,
  REVIEW_TAG_LABEL,
  type EmployerReviewTag,
  type ReviewRequest,
  type ReviewResponse,
} from 'entities/review/model/types/review.type';
import { ReviewTagPicker } from './ReviewTagPicker';
import {
  getEmployerReviewTagVariant,
  sortEmployerReviewTags,
  toggleEmployerReviewTag,
} from './lib/reviewTagVariant';
import Badge from 'shared/ui/Badge/Badge';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';

interface Props {
  applicationId: number;
  /** false: 조회만 (근무 완료 전 지원자·과거 리뷰 확인용) */
  canWrite?: boolean;
}

const toEmployerTags = (tags: ReviewResponse['tags']): EmployerReviewTag[] =>
  sortEmployerReviewTags(
    tags.filter((tag): tag is EmployerReviewTag =>
      EMPLOYER_REVIEW_TAG_PAIRS.some((pair) => pair.positive === tag || pair.negative === tag),
    ),
  );

export const EmployerReviewSection = ({ applicationId, canWrite = true }: Props) => {
  const { data: existingReviews, isLoading } = useReviewsByApplication(applicationId);
  const { mutate: writeReview, isPending: isWriting } = useWriteEmployerReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const errorModal = useErrorAlertModal();

  const employerReview = existingReviews?.find((r) => r.target === 'EMPLOYER_TO_EMPLOYEE');

  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('create');
  const [selectedTags, setSelectedTags] = useState<EmployerReviewTag[]>([]);
  const [content, setContent] = useState('');
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (employerReview) {
      setMode('view');
      setSelectedTags(toEmployerTags(employerReview.tags));
      setContent(employerReview.content ?? '');
    } else if (canWrite) {
      setMode('create');
      setSelectedTags([]);
      setContent('');
    }
    setIsTagPickerOpen(false);
  }, [employerReview, canWrite]);

  const isPending = isWriting || isUpdating || isDeleting;

  const toggleTag = (tag: EmployerReviewTag) => {
    setSelectedTags((prev) => toggleEmployerReviewTag(prev, tag));
  };

  const removeTag = (tag: EmployerReviewTag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const startEdit = () => {
    if (!employerReview) return;
    setSelectedTags(toEmployerTags(employerReview.tags));
    setContent(employerReview.content ?? '');
    setMode('edit');
    setIsTagPickerOpen(false);
  };

  const cancelEdit = () => {
    if (employerReview) {
      setSelectedTags(toEmployerTags(employerReview.tags));
      setContent(employerReview.content ?? '');
      setMode('view');
    } else {
      setSelectedTags([]);
      setContent('');
      setMode('create');
    }
    setIsTagPickerOpen(false);
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0 && !content.trim()) return;

    const data: ReviewRequest = {
      tags: selectedTags,
      content: content.trim() || undefined,
    };

    const onSuccess = () => {
      setMode('view');
      setIsTagPickerOpen(false);
    };

    if (mode === 'edit' && employerReview) {
      updateReview(
        { reviewId: employerReview.reviewId, data },
        {
          onSuccess,
          onError: errorModal.onMutationError('리뷰 수정에 실패했습니다.'),
        },
      );
      return;
    }

    writeReview(
      { applicationId, data },
      {
        onSuccess,
        onError: errorModal.onMutationError('리뷰 저장에 실패했습니다.'),
      },
    );
  };

  const handleDelete = () => {
    if (!employerReview) return;
    deleteReview(employerReview.reviewId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedTags([]);
        setContent('');
        setMode('create');
      },
      onError: errorModal.onMutationError('리뷰 삭제에 실패했습니다.'),
    });
  };

  if (isLoading) return null;

  if (!canWrite && !employerReview) return null;

  if (mode === 'view' && employerReview) {
    return (
      <>
        <S.Wrapper>
          <S.ViewHeader>
            <S.ViewLabel>작성한 리뷰</S.ViewLabel>
            {canWrite && (
              <S.ViewActions>
                <Button
                  type="button"
                  scheme="secondary"
                  buttonSize="xsmall"
                  fontSize="xsmall"
                  onClick={startEdit}
                >
                  <Pencil size={12} />
                  수정
                </Button>
                <Button
                  type="button"
                  scheme="secondary"
                  buttonSize="xsmall"
                  fontSize="xsmall"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={12} />
                  삭제
                </Button>
              </S.ViewActions>
            )}
          </S.ViewHeader>
          <S.TagRow>
            {toEmployerTags(employerReview.tags).map((tag) => {
              const variant = getEmployerReviewTagVariant(tag);
              return (
                <Badge key={tag} scheme={variant === 'negative' ? 'warning' : 'secondary'}>
                  {REVIEW_TAG_LABEL[tag]}
                </Badge>
              );
            })}
          </S.TagRow>
          {employerReview.content && <S.ContentBox>{employerReview.content}</S.ContentBox>}
        </S.Wrapper>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          actions={
            <>
              <Button scheme="secondary" buttonSize="medium" onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </Button>
              <Button
                scheme="primary"
                buttonSize="medium"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </>
          }
        >
          <ModalContent>
            <h2>리뷰 삭제</h2>
            <p>작성한 리뷰를 삭제하시겠습니까?</p>
          </ModalContent>
        </Modal>

        {canWrite && (
          <ErrorAlertModal
            isOpen={errorModal.isOpen}
            message={errorModal.errorMessage}
            onClose={errorModal.close}
          />
        )}
      </>
    );
  }

  if (!canWrite) return null;

  return (
    <>
      <S.Wrapper>
        {mode === 'edit' && (
          <S.FormHeader>
            <S.ViewLabel>리뷰 수정</S.ViewLabel>
            <Button type="button" scheme="secondary" buttonSize="xsmall" fontSize="xsmall" onClick={cancelEdit}>
              취소
            </Button>
          </S.FormHeader>
        )}

        <S.TagRow>
          {sortEmployerReviewTags(selectedTags).map((tag) => (
            <S.TagChip key={tag} $variant={getEmployerReviewTagVariant(tag)}>
              {REVIEW_TAG_LABEL[tag]}
              <S.TagRemove type="button" onClick={() => removeTag(tag)} aria-label="태그 제거">
                <X size={12} />
              </S.TagRemove>
            </S.TagChip>
          ))}

          {!isTagPickerOpen && (
            <S.AddTagButton type="button" onClick={() => setIsTagPickerOpen(true)}>
              태그 추가 <Plus size={14} />
            </S.AddTagButton>
          )}
        </S.TagRow>

        {isTagPickerOpen && (
          <ReviewTagPicker
            pairs={EMPLOYER_REVIEW_TAG_PAIRS}
            selectedTags={selectedTags}
            onToggle={toggleTag}
          />
        )}

        <S.TextArea
          placeholder="개인적인 리뷰를 적어주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        {(isTagPickerOpen || selectedTags.length > 0 || content.trim()) && (
          <S.ActionRow>
            {isTagPickerOpen && (
              <S.CancelButton type="button" onClick={() => setIsTagPickerOpen(false)}>
                태그 선택 닫기
              </S.CancelButton>
            )}
            {(selectedTags.length > 0 || content.trim()) && (
              <S.SubmitButton type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? '저장 중...' : mode === 'edit' ? '수정 저장' : '리뷰 저장'}
              </S.SubmitButton>
            )}
          </S.ActionRow>
        )}
      </S.Wrapper>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px dashed ${({ theme }) => theme.color.border};
    margin-top: 8px;
  `,
  ViewHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  FormHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  ViewLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.subText};
  `,
  ViewActions: styled.div`
    display: flex;
    gap: 6px;
  `,
  TagRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  `,
  TagChip: styled.span<{ $variant: 'positive' | 'negative' }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border: 1px solid
      ${({ theme, $variant }) =>
        $variant === 'negative' ? theme.color.error : theme.color.primary};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    background: ${({ theme, $variant }) =>
      $variant === 'negative' ? theme.badgeScheme.warning.backgroundColor : theme.color.secondary};
    color: ${({ theme, $variant }) =>
      $variant === 'negative' ? theme.color.error : theme.color.tertiary};
  `,
  TagRemove: styled.button`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: ${({ theme }) => theme.color.subText};

    &:hover {
      color: ${({ theme }) => theme.color.error};
    }
  `,
  AddTagButton: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.white};
    border: none;
    border-radius: 50px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;

    svg {
      stroke: ${({ theme }) => theme.color.white};
    }
  `,
  TextArea: styled.textarea`
    width: 100%;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    resize: none;
    outline: none;
    background: ${({ theme }) => theme.color.white};

    &:focus {
      border-color: ${({ theme }) => theme.color.primary};
    }

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  ContentBox: styled.p`
    padding: 12px;
    background: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
  `,
  ActionRow: styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  `,
  CancelButton: styled.button`
    padding: 6px 16px;
    background: ${({ theme }) => theme.color.white};
    color: ${({ theme }) => theme.color.subText};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;
  `,
  SubmitButton: styled.button`
    padding: 6px 16px;
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.white};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
};
