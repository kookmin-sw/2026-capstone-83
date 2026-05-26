import styled from 'styled-components';
import {
  EMPLOYER_REVIEW_TAGS,
  REVIEW_TAG_LABEL,
  type EmployerReviewTag,
} from 'entities/review/model/types/review.type';
import { getEmployerReviewTagVariant } from './lib/reviewTagVariant';

interface Props {
  selectedTag: EmployerReviewTag | null;
  onSelect: (tag: EmployerReviewTag) => void;
}

export const EmployerReviewTagPicker = ({ selectedTag, onSelect }: Props) => {
  return (
    <S.Row>
      {EMPLOYER_REVIEW_TAGS.map((tag) => {
        const variant = getEmployerReviewTagVariant(tag);
        const selected = selectedTag === tag;

        return (
          <S.TagOption
            key={tag}
            type="button"
            $selected={selected}
            $variant={variant}
            onClick={() => onSelect(tag)}
          >
            {REVIEW_TAG_LABEL[tag]}
          </S.TagOption>
        );
      })}
    </S.Row>
  );
};

const S = {
  Row: styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  `,
  TagOption: styled.button<{ $selected: boolean; $variant: 'positive' | 'neutral' | 'negative' }>`
    padding: 10px 12px;
    border: 1px solid
      ${({ theme, $selected, $variant }) => {
        if (!$selected) return theme.color.border;
        if ($variant === 'negative') return theme.color.error;
        if ($variant === 'neutral') return theme.color.subText;
        return theme.color.primary;
      }};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme, $selected }) =>
      $selected ? theme.fontWeight.semibold : theme.fontWeight.regular};
    cursor: pointer;
    background: ${({ theme, $selected, $variant }) => {
      if (!$selected) return theme.color.white;
      if ($variant === 'negative') return theme.badgeScheme.warning.backgroundColor;
      if ($variant === 'neutral') return theme.badgeScheme.neutral.backgroundColor;
      return theme.color.secondary;
    }};
    color: ${({ theme, $selected, $variant }) => {
      if (!$selected) return theme.color.text;
      if ($variant === 'negative') return theme.color.error;
      if ($variant === 'neutral') return theme.color.subText;
      return theme.color.tertiary;
    }};

    &:hover {
      border-color: ${({ theme, $variant }) => {
        if ($variant === 'negative') return theme.color.error;
        if ($variant === 'neutral') return theme.color.subText;
        return theme.color.primary;
      }};
    }
  `,
};
