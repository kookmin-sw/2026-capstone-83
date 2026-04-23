import React, { forwardRef } from "react";
import { ErrorMsg, InputWrapper, Label, RequiredMark, StyledInput, Wrapper } from "./InputStyle";
import type { FontSizeKey } from "shared/types/theme";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelSize?: FontSizeKey;
  error?: string;
}

export const InputText = forwardRef<HTMLInputElement, Props>(
  ({ label, labelSize = 'medium', name, error, required, placeholder, ...rest }, ref) => {
    return (
      <Wrapper>
        {label && (
          <Label htmlFor={name} $labelSize={labelSize}>
            {label}
            {required && <RequiredMark>*</RequiredMark>}
          </Label>
        )}
        <InputWrapper>
          <StyledInput
            id={name}
            name={name}
            placeholder={placeholder}
            $hasError={!!error}
            ref={ref}
            {...rest}
          />
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </InputWrapper>
      </Wrapper>
    );
  }
);

InputText.displayName = 'InputText';