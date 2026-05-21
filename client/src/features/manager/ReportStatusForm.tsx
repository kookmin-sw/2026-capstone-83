import { useState } from 'react';
import type { ReportStatus } from 'entities/manager/model/types/manager.type';
import { useUpdateReportStatus } from 'entities/manager/model/hooks/useManagerQueries';
import { REPORT_STATUS_LABEL } from 'entities/manager/lib/labels';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import { ActionRow } from 'widgets/manager/admin.styled';

interface Props {
  reportId: number;
  currentStatus: ReportStatus;
  currentNote: string | null;
}

const STATUS_OPTIONS = (['IN_PROGRESS', 'RESOLVED'] as ReportStatus[]).map((value) => ({
  value,
  label: REPORT_STATUS_LABEL[value],
}));

const ReportStatusForm = ({ reportId, currentStatus, currentNote }: Props) => {
  const [status, setStatus] = useState<ReportStatus>(
    currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus
  );
  const [adminNote, setAdminNote] = useState(currentNote ?? '');
  const { mutate, isPending } = useUpdateReportStatus(reportId);
  const errorModal = useErrorAlertModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { status, adminNote: adminNote.trim() || undefined },
      {
        onSuccess: () => alert('신고 상태가 저장되었습니다.'),
        onError: errorModal.onMutationError('저장에 실패했습니다.'),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputSelect
        label="처리 상태"
        labelSize="xsmall"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value as ReportStatus)}
      />
      <InputTextarea
        label="관리자 메모"
        labelSize="xsmall"
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="처리 내용을 기록하세요"
        rows={4}
      />
      <ActionRow>
        <Button
          type="submit"
          scheme="primary"
          buttonSize="medium"
          borderRadius="medium"
          disabled={isPending}
        >
          {isPending ? '저장 중...' : '상태 저장'}
        </Button>
      </ActionRow>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </form>
  );
};

export default ReportStatusForm;
