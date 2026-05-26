import styled from 'styled-components';
import { Trash2 } from 'lucide-react';
import type { JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import { isUrgentEnabled } from 'entities/jobPost/lib/urgentJobPost';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  template: JobPostTemplateResponse;
  onLoad: (template: JobPostTemplateResponse) => void;
  onDelete: (id: number) => void;
}

export const TemplateItem = ({ template, onLoad, onDelete }: Props) => {
  return (
    <S.Item>
      <S.Content onClick={() => onLoad(template)}>
        <S.Name>{template.templateName}</S.Name>
        <S.Desc>
          {template.title || '제목 없음'}
          {isUrgentEnabled(template.urgentEnabled) && ' · 급구'}
        </S.Desc>
      </S.Content>
      <S.DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        aria-label="템플릿 삭제"
      >
        <Trash2 size={16} />
      </S.DeleteButton>
    </S.Item>
  );
};

const S = {
  Item: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: ${({ theme }) => theme.color.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    transition: all 0.15s ease;

    ${hoverOverlay}
    /* &:hover {
      background: ${({ theme }) => theme.color.primary};

      span {
        color: ${({ theme }) => theme.color.white};
      }
    } */
  `,
  Content: styled.button`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
  `,
  Name: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.primary};
    transition: color 0.15s ease;
  `,
  Desc: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    transition: color 0.15s ease;
  `,
  DeleteButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;

    svg {
      stroke: ${({ theme }) => theme.color.subText};
      transition: stroke 0.15s ease;
    }

    &:hover {

      svg {
        stroke: ${({ theme }) => theme.color.error};
      }
    }
  `,
};
