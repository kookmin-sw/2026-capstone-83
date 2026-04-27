import type { FontSizeKey } from "shared/types/theme";
import styled, { css } from "styled-components";

interface LabelProps {
  $labelSize?: FontSizeKey;
}


export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Label = styled.label<LabelProps>`
  font-size: ${({ $labelSize, theme }) =>
    ($labelSize && theme.fontSize[$labelSize]) ?
      theme.fontSize[$labelSize] : theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

export const RequiredMark = styled.span`
  margin-left: 0.25rem;
  color: ${({ theme }) => theme.color.error};
`;

export const InputWrapper = styled.div`
  margin-top: 8px;
  position: relative;
  width: 100%;
`;

export const ErrorMsg = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.error};
  margin-left: 0.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px; /* 버튼 사이 간격 */
  margin-top: 8px;
  width: 100%;
`;


const baseStyle = css<{ $hasError: boolean }>`
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  line-height: 1.5;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: ${({ $hasError, theme }) =>
    $hasError ? `1px solid ${theme.color.error}` : 'none'};
  box-shadow: ${({ theme }) => theme.shadow.default};
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.color.subText};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.color.primary};
  }

  &:-webkit-autofill {
  box-shadow: 0 0 0px 1000px ${({ theme }) => theme.color.white} inset;
  -webkit-text-fill-color: ${({ theme }) => theme.color.hoverOverlay};
  transition: background-color 9999s ease-in-out 0s;
}

`;


export const StyledInput = styled.input<{ $hasError: boolean }>`
  ${baseStyle}
`;

export const StyledTextArea = styled.textarea<{ $hasError: boolean }>`
  ${baseStyle}
  margin-top: 8px;
  min-height: 120px;
`;

// shared/ui/Input/InputStyle.ts 에 추가[cite: 11]

export const StyledSelect = styled.select<{ $hasError: boolean }>`
  ${baseStyle}
  appearance: none; /* 기본 화살표 제거 (필요 시 커스텀 가능) */
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%237F7F7F%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  cursor: pointer;

  &:disabled {
    background-color: ${({ theme }) => theme.color.subBackground};
    cursor: not-allowed;
  }
`;


//-- shared/ui/Input/InputSelectCustom.tsx 에 추가[cite: 11]

export const SelectTrigger = styled.div<{ $hasError: boolean; $isOpen: boolean }>`
  /* 기존 InputText와 스타일 통일 */
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme, $hasError, $isOpen }) =>
    $hasError ? theme.color.error : ($isOpen ? theme.color.primary : 'transparent')};
  box-shadow: ${({ theme }) => theme.shadow.default};
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  min-height: 40px;
`;

export const OptionList = styled.ul`
  position: absolute;
  top: calc(100% + 4px); // 입력창 바로 아래 4px 띄움
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadow.default};
  z-index: 100; // 다른 요소 위에 떠야 함
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto; // 내용 많으면 스크롤
`;

export const OptionItem = styled.li<{ $isSelected: boolean }>`
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  cursor: pointer;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.color.secondary : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.color.background};
  }
`;

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.color.subText};
`;

export const ArrowIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;