import styled from 'styled-components';
import {
  REVIEW_TAG_LABEL,
  type ReviewTag,
  type ReviewTagPair,
} from 'entities/review/model/types/review.type';
import { getEmployerReviewTagVariant } from './lib/reviewTagVariant';
import type { EmployerReviewTag } from 'entities/review/model/types/review.type';

interface Props<T extends ReviewTag> {
  pairs: ReviewTagPair<T>[];
  selectedTags: T[];
  onToggle: (tag: T) => void;
}

function TagOptionButton<T extends ReviewTag>({
  tag,
  selected,
  onToggle,
}: {
  tag: T;
  selected: boolean;
  onToggle: (tag: T) => void;
}) {
  const variant = getEmployerReviewTagVariant(tag as EmployerReviewTag);

  return (
    <S.TagOption
      type="button"
      $selected={selected}
      $variant={variant}
      onClick={() => onToggle(tag)}
    >
      {REVIEW_TAG_LABEL[tag]}
    </S.TagOption>
  );
}

export function ReviewTagPicker<T extends ReviewTag>({ pairs, selectedTags, onToggle }: Props<T>) {
  return (
    <S.Grid>
      <S.Row>
        {pairs.map((pair) => (
          <TagOptionButton
            key={pair.positive}
            tag={pair.positive}
            selected={selectedTags.includes(pair.positive)}
            onToggle={onToggle}
          />
        ))}
      </S.Row>
      <S.Row>
        {pairs.map((pair) => (
          <TagOptionButton
            key={pair.negative}
            tag={pair.negative}
            selected={selectedTags.includes(pair.negative)}
            onToggle={onToggle}
          />
        ))}
      </S.Row>
    </S.Grid>
  );
}

const S = {
  Grid: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  `,
  Row: styled.div`
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
    align-items: stretch;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: repeat(6, minmax(72px, 1fr));
      overflow-x: auto;
    }
  `,
  TagOption: styled.button<{ $selected: boolean; $variant: 'positive' | 'negative' }>`
    padding: 6px 8px;
    border: 1px solid
      ${({ theme, $selected, $variant }) => {
        if (!$selected) return theme.color.border;
        return $variant === 'negative' ? theme.color.error : theme.color.primary;
      }};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme, $selected }) =>
      $selected ? theme.fontWeight.medium : theme.fontWeight.regular};
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: ${({ theme, $selected, $variant }) => {
      if (!$selected) return theme.color.white;
      return $variant === 'negative'
        ? theme.badgeScheme.warning.backgroundColor
        : theme.color.secondary;
    }};
    color: ${({ theme, $selected, $variant }) => {
      if (!$selected) return theme.color.text;
      return $variant === 'negative' ? theme.color.error : theme.color.tertiary;
    }};

    &:hover {
      border-color: ${({ theme, $variant }) =>
        $variant === 'negative' ? theme.color.error : theme.color.primary};
      color: ${({ theme, $variant }) =>
        $variant === 'negative' ? theme.color.error : theme.color.tertiary};
    }
  `,
};
