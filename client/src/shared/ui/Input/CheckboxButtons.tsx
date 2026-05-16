
import { ButtonGroup, ErrorMsg, Label, RequiredMark, Wrapper } from './InputStyle';
import Button from 'shared/ui/Button/Button';
import type { FontSizeKey } from 'shared/types/theme';

export interface Option<T extends string | number = string | number> {
  label: string;
  value: T;
}

/** 단일 선택 모드 */
interface SingleProps<T extends string | number> {
  multiple?: false;
  value?: T;
  onChange: (value: T) => void;
  selected?: never;
  onToggle?: never;
}

/** 다중 선택 모드 */
interface MultiProps<T extends string | number> {
  multiple: true;
  selected: T[];
  onToggle: (value: T) => void;
  value?: never;
  onChange?: never;
}

type Props<T extends string | number> = {
  label?: string;
  labelSize?: FontSizeKey;
  options: Option<T>[];
  buttonSize?: 'xsmall' | 'small';
  error?: string;
  required?: boolean;
} & (SingleProps<T> | MultiProps<T>);

export const CheckboxButtons = <T extends string | number>({
  label,
  labelSize = 'medium',
  options,
  buttonSize = 'small',
  error,
  required,
  ...rest
}: Props<T>) => {
  const isMultiple = rest.multiple === true;

  const isActive = (optionValue: T) => {
    if (isMultiple) {
      return (rest as MultiProps<T>).selected.includes(optionValue);
    }
    return (rest as SingleProps<T>).value === optionValue;
  };

  const handleClick = (optionValue: T) => {
    if (isMultiple) {
      (rest as MultiProps<T>).onToggle(optionValue);
    } else {
      (rest as SingleProps<T>).onChange(optionValue);
    }
  };

  return (
    <Wrapper>
      {label && (
        <Label $labelSize={labelSize}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}

      <ButtonGroup>
        {options.map((option) => {
          const active = isActive(option.value);

          return (
            <Button
              key={String(option.value)}
              type="button"
              onClick={() => handleClick(option.value)}
              scheme={active ? 'optionActive' : 'option'}
              buttonSize={buttonSize}
              fontSize="xsmall"
              fontWeight={active ? 'semibold' : 'regular'}
              borderRadius="medium"
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>

      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Wrapper>
  );
};
