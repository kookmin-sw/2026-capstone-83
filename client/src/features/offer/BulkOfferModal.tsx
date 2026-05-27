import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useOfferTargets } from 'entities/jobPost/model/hooks/useOfferTargets';
import { useBulkOffer } from 'entities/jobPost/model/hooks/useBulkOffer';
import type { OfferTarget } from 'entities/jobPost/model/types/offer.type';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Badge from 'shared/ui/Badge/Badge';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  jobPostId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: { offeredCount: number; skippedCount: number }) => void;
}

export const BulkOfferModal = ({ jobPostId, isOpen, onClose, onSuccess }: Props) => {
  const { data: targets, isLoading, isError } = useOfferTargets(jobPostId, isOpen);
  const { mutate: sendBulkOffer, isPending } = useBulkOffer(jobPostId);
  const errorModal = useErrorAlertModal();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [instantHire, setInstantHire] = useState(false);

  /** 장기근무 대상을 목록 상단에 두기 (서버 순서와 무관하게 동일 우선순위 유지) */
  const orderedTargets = useMemo(() => {
    if (!targets?.length) return [];
    return [...targets].sort((a, b) => {
      if (a.longTerm === b.longTerm) return 0;
      return a.longTerm ? -1 : 1;
    });
  }, [targets]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
      setInstantHire(false);
      return;
    }
    if (!orderedTargets.length) return;
    setSelectedIds(new Set(orderedTargets.map((t) => t.userId)));
  }, [isOpen, orderedTargets]);

  const toggleOne = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (!orderedTargets.length) return;
    if (selectedIds.size === orderedTargets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orderedTargets.map((t) => t.userId)));
    }
  };

  const handleSubmit = () => {
    const userIds = Array.from(selectedIds);
    if (userIds.length === 0) return;

    sendBulkOffer(
      { userIds, instantHire },
      {
        onSuccess: (result) => {
          onClose();
          onSuccess?.(result);
          alert(
            `채용 제안을 보냈습니다.\n성공 ${result.offeredCount}명 · 제외 ${result.skippedCount}명`,
          );
        },
        onError: errorModal.onMutationError('일괄 제안에 실패했습니다.'),
      },
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        actions={
          <>
            <Button scheme="secondary" buttonSize="large" borderRadius="medium" onClick={onClose}>
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={handleSubmit}
              disabled={isPending || selectedIds.size === 0}
            >
              {isPending ? '전송 중...' : `선택 ${selectedIds.size}명에게 제안`}
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>우선 채용 대상 일괄 제안</h2>
          <S.Hint>
            장기근무 구직자를 먼저, 이어서 관심(이력서 좋아요) 인재를 표시합니다. 이미 제안·지원·일정
            충돌 대상은 서버에서 자동 제외됩니다.
          </S.Hint>

          {isLoading && <Loading message="대상자를 불러오는 중..." />}
          {isError && <S.Empty>대상자 목록을 불러오지 못했습니다.</S.Empty>}
          {!isLoading && !isError && orderedTargets.length === 0 && (
            <S.Empty>
              제안 가능한 우선 대상이 없습니다. 인재풀에서 이력서 좋아요·장기근무를 등록해
              보세요.
            </S.Empty>
          )}
          {!isLoading && orderedTargets.length > 0 && (
            <>
              <S.Toolbar>
                <Button scheme="secondary" buttonSize="xsmall" onClick={toggleAll}>
                  {selectedIds.size === orderedTargets.length ? '전체 해제' : '전체 선택'}
                </Button>
                <S.Count>{orderedTargets.length}명</S.Count>
              </S.Toolbar>
              <S.List>
                {orderedTargets.map((target) => (
                  <TargetRow
                    key={target.userId}
                    target={target}
                    checked={selectedIds.has(target.userId)}
                    onToggle={() => toggleOne(target.userId)}
                  />
                ))}
              </S.List>

              <S.InstantHireBlock>
                <S.InstantHireLabel>
                  <input
                    type="checkbox"
                    checked={instantHire}
                    onChange={(e) => setInstantHire(e.target.checked)}
                  />
                  <span>구직자가 승인하면 즉시 채용되게 하시겠습니까?</span>
                </S.InstantHireLabel>
                <S.InstantHireHint>
                  체크하면 제안 수락 시 바로 채용이 확정되고, 해제하면 고용주 최종 확정 단계를 거칩니다.
                </S.InstantHireHint>
              </S.InstantHireBlock>
            </>
          )}
        </ModalContent>
      </Modal>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const TargetRow = ({
  target,
  checked,
  onToggle,
}: {
  target: OfferTarget;
  checked: boolean;
  onToggle: () => void;
}) => (
  <S.Row>
    <label>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <S.Name>{target.name}</S.Name>
    </label>
    <S.Badges>
      {target.longTerm && <Badge scheme="primary">장기근무</Badge>}
      {target.liked && <Badge scheme="secondary">관심</Badge>}
    </S.Badges>
  </S.Row>
);

const S = {
  Hint: styled.p`
    margin: 0 0 16px;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
  Empty: styled.p`
    margin: 0;
    padding: 24px 0;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
  Toolbar: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  `,
  Count: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  List: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 320px;
    overflow-y: auto;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};

    label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      flex: 1;
      min-width: 0;
    }

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: ${({ theme }) => theme.color.primary};
    }
  `,
  Name: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  Badges: styled.div`
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  `,
  InstantHireBlock: styled.div`
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
  InstantHireLabel: styled.label`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    line-height: 1.45;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: ${({ theme }) => theme.color.primary};
    }
  `,
  InstantHireHint: styled.p`
    margin: 8px 0 0 26px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
};
