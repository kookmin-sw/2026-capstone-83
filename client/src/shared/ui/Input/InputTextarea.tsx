import React, { forwardRef } from "react";
import { ErrorMsg, InputWrapper, Label, RequiredMark, StyledTextArea, Wrapper } from "./InputStyle";
import type { FontSizeKey } from "shared/types/theme";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  labelSize?: FontSizeKey;
  error?: string;
}

export const InputTextarea = forwardRef<HTMLTextAreaElement, Props>(
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
          <StyledTextArea
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

InputTextarea.displayName = 'InputTextarea';