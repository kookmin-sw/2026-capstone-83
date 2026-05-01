
import { ButtonGroup, ErrorMsg, Label, RequiredMark, Wrapper } from './InputStyle';
import Button from 'shared/ui/Button/Button'; // 기존 버튼 컴포넌트 import
import type { FontSizeKey } from 'shared/types/theme';

export interface Option {
  label: string;
  value: number;
}

interface Props {
  label?: string;
  labelSize?: FontSizeKey;
  name: string;
  value?: number; // 현재 선택된 값
  onChange: (value: number) => void; // 값을 변경하는 함수
  options: Option[]; // 선택지 배열 [{label: '남성', value: 0}, ...]
  error?: string;
  required?: boolean;
}

export const CheckboxButtons = ({
  label,
  labelSize = 'medium',
  name,
  value,
  onChange,
  options,
  error,
  required,
}: Props) => {
  return (
    <Wrapper>
      {label && (
        <Label htmlFor={name} $labelSize={labelSize}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}

      <ButtonGroup>
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <Button
              key={option.value}
              type="button" // 폼 제출 방지
              onClick={() => onChange(option.value)} // 클릭 시 값 변경
              scheme={isActive ? 'optionActive' : 'option'}
              buttonSize="small"
              fontSize="xsmall"
              fontWeight={isActive ? 'semibold' : 'medium'}
              borderRadius="medium"
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>

      {/* 에러 메시지가 버튼 그룹 아래에 표시됨 */}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Wrapper>
  );
};