import styled from 'styled-components';
import { TemplateSection } from './TemplateSection';
import type { JobPostTemplateRequest, JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import Button from 'shared/ui/Button/Button';

interface Props {
  getFormValues: () => Partial<JobPostTemplateRequest>;
  onLoadTemplate: (template: JobPostTemplateResponse) => void;
  submitLabel?: string;
  showTemplates?: boolean;
  isSubmitting?: boolean;
}

export const JobPostSubmitCard = ({
  getFormValues,
  onLoadTemplate,
  submitLabel = '+ 공고 등록',
  showTemplates = true,
  isSubmitting = false,
}: Props) => {
  return (
    <S.Card>
      <Button type="submit" scheme="primary" buttonSize="large" disabled={isSubmitting}>
        {submitLabel}
      </Button>

      {showTemplates && (
        <TemplateSection
          getFormValues={getFormValues}
          onLoadTemplate={onLoadTemplate}
        />
      )}
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    background: ${({ theme }) => theme.color.white};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    /* box-shadow: ${({ theme }) => theme.shadow.default}; */
  `,
};
