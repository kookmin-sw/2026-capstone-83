import styled from 'styled-components';
import { TemplateSection } from './TemplateSection';
import type { JobPostTemplateRequest, JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import Button from 'shared/ui/Button/Button';

interface Props {
  getFormValues: () => Partial<JobPostTemplateRequest>;
  onLoadTemplate: (template: JobPostTemplateResponse) => void;
}

export const JobPostSubmitCard = ({ getFormValues, onLoadTemplate }: Props) => {
  return (
    <S.Card>
      {/* 공고 등록 버튼 */}
      <Button type="submit" scheme="primary" buttonSize="large">
        + 공고 등록
      </Button>

      {/* 템플릿 섹션 */}
      <TemplateSection
        getFormValues={getFormValues}
        onLoadTemplate={onLoadTemplate}
      />
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
