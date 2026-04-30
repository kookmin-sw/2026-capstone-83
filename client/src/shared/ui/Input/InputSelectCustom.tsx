import { useState, useRef, useEffect } from 'react';
import { Wrapper, Label, RequiredMark, InputWrapper, ErrorMsg, SelectTrigger, Placeholder, ArrowIcon, OptionList, OptionItem } from './InputStyle';
import type { FontSizeKey } from 'shared/types/theme';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  label?: string;
  labelSize?: FontSizeKey;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const InputSelectCustom = ({
  label,
  labelSize,
  options,
  value,
  onChange,
  placeholder,
  error,
  required,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 옵션의 label 찾기
  const selectedOption = options.find((opt) => opt.value === value);

  // 외부 클릭 시 닫기 로직 (커스텀 UI의 필수 요소!)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Wrapper ref={containerRef}>
      {label && (
        <Label $labelSize={labelSize}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}

      <InputWrapper>
        {/* 현재 값 표시 창 */}
        <SelectTrigger
          onClick={() => setIsOpen(!isOpen)}
          $hasError={!!error}
          $isOpen={isOpen}
        >
          {selectedOption ? selectedOption.label : <Placeholder>{placeholder}</Placeholder>}
          <ArrowIcon $isOpen={isOpen}>▼</ArrowIcon>
        </SelectTrigger>

        {/* 드롭다운 옵션 리스트 */}
        {isOpen && (
          <OptionList>
            {options.map((option) => (
              <OptionItem
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                $isSelected={value === option.value}
              >
                {option.label}
              </OptionItem>
            ))}
          </OptionList>
        )}
      </InputWrapper>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Wrapper>
  );
};