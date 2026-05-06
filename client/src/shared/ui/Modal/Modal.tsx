import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styled from 'styled-components';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

const Modal = ({ isOpen, onClose, children, actions }: Props) => {
  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="닫기">
          <X size={24} />
        </CloseButton>

        <Content>{children}</Content>

        {actions && <Actions>{actions}</Actions>}
      </ModalContainer>
    </Overlay>,
    document.body
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text};
  border-radius: 50%;
  transition: background-color 0.15s ease;
  z-index: 1;

  &:hover {
    background-color: ${({ theme }) => theme.color.background};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 48px 32px 24px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 32px 32px;

  & > * {
    flex: 1;
  }
`;

export default Modal;
