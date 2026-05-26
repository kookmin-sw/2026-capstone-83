import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import {
  useWriteEmployeeReview,
  useUpdateReview,
  useDeleteReview,
  useReviewsByApplication,
} from 'entities/review/model/hooks/useReview';
import {
  EMPLOYEE_REVIEW_TAG_PAIRS,
  REVIEW_TAG_LABEL,
  type EmployeeReviewTag,
  type ReviewRequest,
  type ReviewResponse,
  type ReviewTag,
} from 'entities/review/model/types/review.type';
import { ReviewTagPicker } from './ReviewTagPicker';
import {
  getEmployeeReviewBadgeScheme,
  getEmployeeReviewTagVariant,
  sortEmployeeReviewTags,
  toggleEmployeeReviewTag,
} from './lib/reviewTagVariant';
import Badge from 'shared/ui/Badge/Badge';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';

interface Props {
  applicationId: number;
  /** false: 조회만 */
  canWrite?: boolean;
  /** 공고 카드 하단에 붙는 레이아웃 */
  embedded?: boolean;
}

const isEmployeeReviewTag = (tag: ReviewTag): tag is EmployeeReviewTag =>
  EMPLOYEE_REVIEW_TAG_PAIRS.some((pair) => pair.positive === tag || pair.negative === tag);

const toEmployeeTags = (tags: ReviewResponse['tags']): EmployeeReviewTag[] =>
  sortEmployeeReviewTags(tags.filter(isEmployeeReviewTag));

export const EmployeeReviewSection = ({ applicationId, canWrite = true, embedded = false }: Props) => {
  const { data: existingReviews, isLoading } = useReviewsByApplication(applicationId);
  const { mutate: writeReview, isPending: isWriting } = useWriteEmployeeReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const errorModal = useErrorAlertModal();

  const employeeReview = existingReviews?.find((r) => r.target === 'EMPLOYEE_TO_WORKPLACE');

  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('create');
  const [selectedTags, setSelectedTags] = useState<EmployeeReviewTag[]>([]);
  const [content, setContent] = useState('');
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (employeeReview) {
      setMode('view');
      setSelectedTags(toEmployeeTags(employeeReview.tags));
      setContent(employeeReview.content ?? '');
    } else if (canWrite) {
      setMode('create');
      setSelectedTags([]);
      setContent('');
    }
    setIsTagPickerOpen(false);
  }, [employeeReview, canWrite]);

  const isPending = isWriting || isUpdating || isDeleting;

  const toggleTag = (tag: EmployeeReviewTag) => {
    setSelectedTags((prev) => toggleEmployeeReviewTag(prev, tag));
  };

  const removeTag = (tag: EmployeeReviewTag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const startEdit = () => {
    if (!employeeReview) return;
    setSelectedTags(toEmployeeTags(employeeReview.tags));
    setContent(employeeReview.content ?? '');
    setMode('edit');
    setIsTagPickerOpen(false);
  };

  const cancelEdit = () => {
    if (employeeReview) {
      setSelectedTags(toEmployeeTags(employeeReview.tags));
      setContent(employeeReview.content ?? '');
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

    if (mode === 'edit' && employeeReview) {
      updateReview(
        { reviewId: employeeReview.reviewId, data },
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
    if (!employeeReview) return;
    deleteReview(employeeReview.reviewId, {
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

  if (!canWrite && !employeeReview) return null;

  if (mode === 'view' && employeeReview) {
    const viewTags = toEmployeeTags(employeeReview.tags);

    return (
      <>
        <S.Wrapper $embedded={embedded}>
          <S.ViewHeader>
            <S.ViewLabel>작성한 작업장 리뷰</S.ViewLabel>
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
            {viewTags.length > 0
              ? viewTags.map((tag) => (
                  <Badge key={tag} scheme={getEmployeeReviewBadgeScheme(tag)} fontSize="xsmall">
                    {REVIEW_TAG_LABEL[tag]}
                  </Badge>
                ))
              : employeeReview.tagLabels.map((label) => (
                  <Badge key={label} scheme="neutral" fontSize="xsmall">
                    {label}
                  </Badge>
                ))}
          </S.TagRow>
          {employeeReview.content && <S.ContentBox>{employeeReview.content}</S.ContentBox>}
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
      <S.Wrapper $embedded={embedded}>
        {mode === 'edit' ? (
          <S.FormHeader>
            <S.ViewLabel>작업장 리뷰 수정</S.ViewLabel>
            <Button type="button" scheme="secondary" buttonSize="xsmall" fontSize="xsmall" onClick={cancelEdit}>
              취소
            </Button>
          </S.FormHeader>
        ) : (
          <S.ViewLabel>작업장 리뷰 작성</S.ViewLabel>
        )}

        <S.TagRow>
          {sortEmployeeReviewTags(selectedTags).map((tag) => (
            <S.TagChip key={tag} $variant={getEmployeeReviewTagVariant(tag)}>
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
            pairs={EMPLOYEE_REVIEW_TAG_PAIRS}
            selectedTags={selectedTags}
            onToggle={toggleTag}
          />
        )}

        <S.TextArea
          placeholder="작업장에 대한 리뷰를 적어주세요 (선택)"
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
  Wrapper: styled.div<{ $embedded?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: ${({ $embedded }) => ($embedded ? '12px 16px 16px' : '12px 0 0')};
    margin-top: ${({ $embedded }) => ($embedded ? '0' : '4px')};
    border-top: ${({ $embedded, theme }) =>
      $embedded ? 'none' : `1px dashed ${theme.color.border}`};
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
