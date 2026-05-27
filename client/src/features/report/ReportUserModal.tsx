import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from 'shared/ui/Modal/Modal';
import Button from 'shared/ui/Button/Button';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import { createReport } from 'entities/report/api/report.api';
import type { ReportReason } from 'entities/report/model/report.types';
import { REPORT_REASON_OPTIONS } from 'entities/report/lib/reportLabels';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import styled from 'styled-components';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: number;
  /** 모달 제목/설명에 표시할 대상 이름 등 */
  targetLabel: string;
  onSuccess?: () => void;
}

const ReportUserModal = ({ isOpen, onClose, targetUserId, targetLabel, onSuccess }: Props) => {
  const [reason, setReason] = useState<ReportReason>('OTHER');
  const [detail, setDetail] = useState('');
  const errorModal = useErrorAlertModal();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createReport({
        targetUserId,
        reason,
        detail: detail.trim() || undefined,
      }),
    onSuccess: () => {
      onSuccess?.();
      onClose();
      setDetail('');
      setReason('OTHER');
    },
    onError: errorModal.onMutationError('신고 접수에 실패했습니다.'),
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        actions={
          <>
            <Button
              type="button"
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="button"
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending ? '접수 중...' : '신고 접수'}
            </Button>
          </>
        }
      >
        <S.Body>
          <h2 id="report-modal-title">신고하기</h2>
          <p className="desc">
            <strong>{targetLabel}</strong>님을 신고합니다. 허위 신고는 제재 대상이 될 수 있습니다.
          </p>
          <InputSelect
            label="사유"
            labelSize="xsmall"
            options={REPORT_REASON_OPTIONS}
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
          />
          <InputTextarea
            label="상세 내용 (선택)"
            labelSize="xsmall"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="상황을 구체적으로 적어주시면 처리에 도움이 됩니다."
            rows={4}
          />
        </S.Body>
      </Modal>
      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const S = {
  Body: styled.div`
    padding: 8px 8px 0;
    h2 {
      margin: 0 0 8px;
      font-size: ${({ theme }) => theme.fontSize.large};
    }
    .desc {
      margin: 0 0 20px;
      font-size: ${({ theme }) => theme.fontSize.small};
      color: ${({ theme }) => theme.color.subText};
      line-height: 1.5;
    }
  `,
};

export default ReportUserModal;
