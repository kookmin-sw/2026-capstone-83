import { useState } from 'react';
import styled from 'styled-components';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from 'entities/jobPost/model/hooks/useTemplates';
import type { JobPostTemplateRequest, JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import { TemplateItem } from './TemplateItem';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import { InputText } from 'shared/ui/Input/InputText';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';

interface Props {
  getFormValues: () => Partial<JobPostTemplateRequest>;
  onLoadTemplate: (template: JobPostTemplateResponse) => void;
}

export const TemplateSection = ({ getFormValues, onLoadTemplate }: Props) => {
  const { data: templates } = useTemplates();
  const { mutate: createTemplate, isPending } = useCreateTemplate();
  const { mutate: deleteTemplate } = useDeleteTemplate();
  const [isNaming, setIsNaming] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const errorModal = useErrorAlertModal();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const formValues = getFormValues();

    // 빈 문자열을 undefined로 정리 (서버 파싱 에러 방지)
    const cleaned: JobPostTemplateRequest = {
      templateName: templateName.trim(),
      title: formValues.title || undefined,
      jobCategory: formValues.jobCategory || undefined,
      jobSubcategory: formValues.jobSubcategory || undefined,
      wage: formValues.wage || undefined,
      wageType: formValues.wageType || undefined,
      workStart: formValues.workStart || undefined,
      workEnd: formValues.workEnd || undefined,
      totalSlots: formValues.totalSlots || undefined,
      description: formValues.description || undefined,
      requirements: formValues.requirements?.length ? formValues.requirements : undefined,
      benefits: formValues.benefits?.length ? formValues.benefits : undefined,
      tasks: formValues.tasks?.length ? formValues.tasks : undefined,
      items: formValues.items?.length ? formValues.items : undefined,
      urgentEnabled: formValues.urgentEnabled ?? false,
      urgentWageIncrease: formValues.urgentEnabled ? formValues.urgentWageIncrease : undefined,
      autoOfferEnabled: formValues.autoOfferEnabled ?? false,
    };

    createTemplate(cleaned, {
      onSuccess: () => {
        setIsNaming(false);
        setTemplateName('');
      },
      onError: errorModal.onMutationError('템플릿 저장에 실패했습니다.'),
    });
  };

  return (
    <S.Wrapper>
      <S.SectionTitle>템플릿 불러오기</S.SectionTitle>

      {templates && templates.length > 0 ? (
        <S.TemplateList>
          {templates.map((tpl) => (
            <TemplateItem
              key={tpl.id}
              template={tpl}
              onLoad={onLoadTemplate}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))}
        </S.TemplateList>
      ) : (
        <S.EmptyText>저장된 템플릿이 없습니다.</S.EmptyText>
      )}

      {!isNaming ? (
        <Button
          type="button"
          scheme="secondary"
          buttonSize="large"
          onClick={() => setIsNaming(true)}
        >
          템플릿 등록
        </Button>
      ) : (
        <S.NameInputRow>
          <InputText
            placeholder="템플릿 이름"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <S.NameActions>
            <Button
              type="button"
              scheme="primary"
              buttonSize="xsmall"
              fontSize='small'
              onClick={handleSaveTemplate}
              disabled={isPending || !templateName.trim()}
            >
              {isPending ? '저장 중...' : '저장'}
            </Button>
            <Button
              type="button"
              scheme="secondary"
              buttonSize="xsmall"
              fontSize='small'
              onClick={() => { setIsNaming(false); setTemplateName(''); }}
            >
              취소
            </Button>
          </S.NameActions>
        </S.NameInputRow>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              onClick={() => setDeleteTargetId(null)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              onClick={() => {
                if (deleteTargetId) {
                  deleteTemplate(deleteTargetId, {
                    onSuccess: () => setDeleteTargetId(null),
                    onError: errorModal.onMutationError('템플릿 삭제에 실패했습니다.'),
                  });
                }
              }}
            >
              삭제
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>템플릿 삭제</h2>
          <p>이 템플릿을 삭제하시겠습니까?</p>
        </ModalContent>
      </Modal>

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  SectionTitle: styled.h4`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  TemplateList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  EmptyText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    text-align: center;
    padding: 16px 0;
    margin: 0;
  `,
  NameInputRow: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  NameActions: styled.div`
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  `,
};
