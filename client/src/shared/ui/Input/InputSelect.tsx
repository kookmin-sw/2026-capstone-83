// shared/ui/Input/InputSelect.tsx

import React, { forwardRef } from "react";
import { ErrorMsg, InputWrapper, Label, RequiredMark, StyledSelect, Wrapper } from "./InputStyle";
import type { FontSizeKey } from "shared/types/theme";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelSize?: FontSizeKey;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const InputSelect = forwardRef<HTMLSelectElement, Props>(
  ({ label, labelSize = 'medium', name, options, error, required, placeholder, ...rest }, ref) => {
    return (
      <Wrapper>
        {label && (
          <Label htmlFor={name} $labelSize={labelSize}>
            {label}
            {required && <RequiredMark>*</RequiredMark>}
          </Label>
        )}
        <InputWrapper>
          <StyledSelect
            id={name}
            name={name}
            $hasError={!!error}
            ref={ref}
            {...rest}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </InputWrapper>
      </Wrapper>
    );
  }
);

InputSelect.displayName = 'InputSelect';