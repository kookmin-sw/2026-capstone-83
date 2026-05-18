import { useState } from 'react';
import styled from 'styled-components';
import { Plus, X, Pencil } from 'lucide-react';
import { useWriteEmployerReview, useReviewsByApplication } from 'entities/review/model/hooks/useReview';
import { REVIEW_TAG_LABEL } from 'entities/review/model/types/review.type';
import type { EmployerReviewTag, ReviewRequest } from 'entities/review/model/types/review.type';
import Badge from 'shared/ui/Badge/Badge';

const EMPLOYER_TAGS: EmployerReviewTag[] = [
  'PUNCTUAL',
  'HARD_WORKING',
  'QUICK_LEARNER',
  'GOOD_MANNER',
  'RESPONSIBLE',
  'WANT_REHIRE',
];

interface Props {
  applicationId: number;
}

export const EmployerReviewSection = ({ applicationId }: Props) => {
  const { data: existingReviews } = useReviewsByApplication(applicationId);
  const { mutate: writeReview } = useWriteEmployerReview();

  const [selectedTags, setSelectedTags] = useState<EmployerReviewTag[]>([]);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);

  // 기존 리뷰가 있으면 표시만
  const employerReview = existingReviews?.find((r) => r.target === 'EMPLOYER_TO_EMPLOYEE');

  const toggleTag = (tag: EmployerReviewTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeTag = (tag: EmployerReviewTag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0 && !content.trim()) return;
    const data: ReviewRequest = {
      tags: selectedTags,
      content: content.trim() || undefined,
    };
    writeReview({ applicationId, data }, {
      onSuccess: () => {
        setIsEditing(false);
        setIsTagPickerOpen(false);
      },
    });
  };

  const handleCancelTagPicker = () => {
    setIsTagPickerOpen(false);
  };

  // 이미 리뷰를 작성한 경우 읽기 전용 표시
  if (employerReview) {
    return (
      <S.Wrapper>
        <S.TagRow>
          {employerReview.tags.map((tag) => (
            <Badge key={tag} scheme="primary">{REVIEW_TAG_LABEL[tag]}</Badge>
          ))}
        </S.TagRow>
        {employerReview.content && (
          <S.ContentBox>{employerReview.content}</S.ContentBox>
        )}
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      {/* 태그 영역 */}
      <S.TagRow>
        {selectedTags.map((tag) => (
          <S.TagChip key={tag}>
            {REVIEW_TAG_LABEL[tag]}
            <S.TagRemove onClick={() => removeTag(tag)}>
              <X size={12} />
            </S.TagRemove>
          </S.TagChip>
        ))}

        {/* 태그 추가 버튼 — 태그 목록 펼쳐진 상태에서는 숨김 */}
        {!isTagPickerOpen && (
          <S.AddTagButton onClick={() => setIsTagPickerOpen(true)}>
            태그 추가 <Plus size={14} />
          </S.AddTagButton>
        )}
      </S.TagRow>

      {/* 태그 선택 목록 — 다중 선택 가능, 저장 전까지 유지 */}
      {isTagPickerOpen && (
        <S.TagPicker>
          {EMPLOYER_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <S.TagOption
                key={tag}
                $selected={isSelected}
                onClick={() => toggleTag(tag)}
              >
                {REVIEW_TAG_LABEL[tag]}
              </S.TagOption>
            );
          })}
        </S.TagPicker>
      )}

      {/* 텍스트 리뷰 영역 */}
      <S.TextAreaWrapper>
        <S.TextArea
          placeholder="개인적인 리뷰를 적어주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isEditing}
          rows={3}
        />
        <S.EditButton onClick={() => setIsEditing(!isEditing)}>
          <Pencil size={14} />
        </S.EditButton>
      </S.TextAreaWrapper>

      {/* 제출 / 취소 버튼 */}
      {(isTagPickerOpen || selectedTags.length > 0 || content.trim()) && (
        <S.ActionRow>
          {isTagPickerOpen && (
            <S.CancelButton type="button" onClick={handleCancelTagPicker}>
              취소
            </S.CancelButton>
          )}
          {(selectedTags.length > 0 || content.trim()) && (
            <S.SubmitButton type="button" onClick={handleSubmit}>
              리뷰 저장
            </S.SubmitButton>
          )}
        </S.ActionRow>
      )}
    </S.Wrapper>
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
  TagRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  `,
  TagChip: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: ${({ theme }) => theme.color.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.text};
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

    &:hover {
      opacity: 0.9;
    }
  `,
  TagPicker: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px;
    background: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  `,
  TagOption: styled.button<{ $selected: boolean }>`
    padding: 6px 12px;
    background: ${({ theme, $selected }) =>
      $selected ? theme.color.secondary : theme.color.white};
    border: 1px solid
      ${({ theme, $selected }) =>
        $selected ? theme.color.primary : theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme, $selected }) =>
      $selected ? theme.color.primary : theme.color.text};
    font-weight: ${({ theme, $selected }) =>
      $selected ? theme.fontWeight.medium : theme.fontWeight.regular};
    cursor: pointer;

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
  TextAreaWrapper: styled.div`
    position: relative;
  `,
  TextArea: styled.textarea`
    width: 100%;
    padding: 12px;
    padding-right: 36px;
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

    &:disabled {
      background: ${({ theme }) => theme.color.background};
      cursor: default;
    }

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  EditButton: styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.color.subText};

    &:hover {
      color: ${({ theme }) => theme.color.primary};
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

    &:hover {
      color: ${({ theme }) => theme.color.text};
      border-color: ${({ theme }) => theme.color.subText};
    }
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

    &:hover {
      opacity: 0.9;
    }
  `,
};
