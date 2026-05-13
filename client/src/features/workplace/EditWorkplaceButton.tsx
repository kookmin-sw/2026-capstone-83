import { useState } from 'react';
import { Pencil } from 'lucide-react';
import styled from 'styled-components';
import type { Workplace } from 'entities/workplace/model/types/workplace.type';
import { CreateWorkplaceModal } from './CreateWorkplaceModal';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  workplace: Workplace;
}

const EditWorkplaceButton = ({ workplace }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <S.Button onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
        <Pencil size={16} />
        <span>수정하기</span>
      </S.Button>

      <CreateWorkplaceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialData={workplace}
      />
    </>
  );
};

const S = {
  Button: styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 16px;
    flex: 1;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.text};
    cursor: pointer;
    transition: all 0.15s ease;

    ${hoverOverlay}
  `,
};

export default EditWorkplaceButton;
