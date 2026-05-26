import styled from 'styled-components';
import { useLikedResumes } from 'entities/resume/model/hooks/useLikedResumes';
import { useLongTermWorkerList } from 'entities/longTermWorker/model/hooks/useLongTermWorkerList';
import type { ResumeCardItem } from 'entities/resume/model/types/resume.type';
import Button from 'shared/ui/Button/Button';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  enabled: boolean;
  selectedUserIds: Set<number>;
  onChange: (next: Set<number>) => void;
}

export const AutoOfferTargetPicker = ({ enabled, selectedUserIds, onChange }: Props) => {
  const {
    data: likedResumes = [],
    isLoading: likedLoading,
    isError: likedError,
  } = useLikedResumes(enabled);
  const {
    data: longTermWorkers = [],
    isLoading: longTermLoading,
    isError: longTermError,
  } = useLongTermWorkerList(enabled);

  if (!enabled) return null;

  const toggleOne = (userId: number) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    onChange(next);
  };

  const toggleSection = (items: ResumeCardItem[]) => {
    const ids = items.map((i) => i.userId).filter((id): id is number => id != null);
    if (ids.length === 0) return;
    const allSelected = ids.every((id) => selectedUserIds.has(id));
    const next = new Set(selectedUserIds);
    if (allSelected) {
      ids.forEach((id) => next.delete(id));
    } else {
      ids.forEach((id) => next.add(id));
    }
    onChange(next);
  };

  const isLoading = likedLoading || longTermLoading;

  return (
    <S.Panel>
      <S.Hint>
        공고 등록 후 선택한 구직자에게 채용 제안이 발송됩니다. 두 목록에서 중복 인원은 한 번만
        제안됩니다.
      </S.Hint>

      {isLoading && <Loading message="제안 대상을 불러오는 중..." />}

      {!isLoading && (
        <>
          <TargetSection
            title="좋아요한 구직자"
            items={likedResumes}
            isError={likedError}
            emptyMessage="좋아요한 구직자가 없습니다."
            selectedUserIds={selectedUserIds}
            onToggleOne={toggleOne}
            onToggleSection={() => toggleSection(likedResumes)}
          />
          <TargetSection
            title="장기근무 구직자"
            items={longTermWorkers}
            isError={longTermError}
            emptyMessage="장기근무로 등록한 구직자가 없습니다."
            selectedUserIds={selectedUserIds}
            onToggleOne={toggleOne}
            onToggleSection={() => toggleSection(longTermWorkers)}
          />
        </>
      )}

      <S.Summary>선택 {selectedUserIds.size}명</S.Summary>
    </S.Panel>
  );
};

const TargetSection = ({
  title,
  items,
  isError,
  emptyMessage,
  selectedUserIds,
  onToggleOne,
  onToggleSection,
}: {
  title: string;
  items: ResumeCardItem[];
  isError: boolean;
  emptyMessage: string;
  selectedUserIds: Set<number>;
  onToggleOne: (userId: number) => void;
  onToggleSection: () => void;
}) => {
  const selectable = items.filter((i) => i.userId != null);
  const sectionIds = selectable.map((i) => i.userId!);
  const allSelected =
    sectionIds.length > 0 && sectionIds.every((id) => selectedUserIds.has(id));

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{title}</S.SectionTitle>
        {selectable.length > 0 && (
          <Button scheme="secondary" buttonSize="xsmall" type="button" onClick={onToggleSection}>
            {allSelected ? '전체 해제' : '전체 선택'}
          </Button>
        )}
        <S.Count>{selectable.length}명</S.Count>
      </S.SectionHeader>

      {isError && <S.Empty>목록을 불러오지 못했습니다.</S.Empty>}
      {!isError && selectable.length === 0 && <S.Empty>{emptyMessage}</S.Empty>}
      {!isError && selectable.length > 0 && (
        <S.List>
          {selectable.map((item) => (
            <S.Row key={`${title}-${item.userId}`}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(item.userId!)}
                  onChange={() => onToggleOne(item.userId!)}
                />
                <S.Name>{item.name}</S.Name>
                {item.firstCareerTitle && (
                  <S.Meta>
                    {item.firstCareerTitle}
                    {(item.firstCareerYears > 0 || item.firstCareerMonths > 0) &&
                      ` · ${item.firstCareerYears}년 ${item.firstCareerMonths}개월`}
                  </S.Meta>
                )}
              </label>
            </S.Row>
          ))}
        </S.List>
      )}
    </S.Section>
  );
};

const S = {
  Panel: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
    padding: 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.background};
  `,
  Hint: styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  `,
  SectionTitle: styled.h4`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    flex: 1;
    min-width: 120px;
  `,
  Count: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  List: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
  `,
  Row: styled.div`
    padding: 8px 10px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};

    label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      flex-wrap: wrap;
    }

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: ${({ theme }) => theme.color.primary};
      flex-shrink: 0;
    }
  `,
  Name: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  Meta: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  Empty: styled.p`
    margin: 0;
    padding: 8px 0;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  Summary: styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.primary};
  `,
};
