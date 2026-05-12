
import styled from 'styled-components';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { hoverOverlay } from 'shared/styles/hoverOverlay';
import type { BorderRadiusKey, ButtonScheme, ButtonSize, FontSizeKey, FontWeightKey } from 'shared/types/theme';


interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  buttonSize: ButtonSize;
  fontSize?: FontSizeKey;
  fontWeight?: FontWeightKey;
  scheme: ButtonScheme;
  borderRadius?: BorderRadiusKey;
}

const Button = ({
  children,
  buttonSize,
  fontSize,
  fontWeight = 'medium',
  scheme,
  borderRadius = 'medium',
  onClick,
  ...rest

}: Props) => {
  return (
    <ButtonStyle
      buttonSize={buttonSize}
      fontSize={fontSize}
      fontWeight={fontWeight}
      scheme={scheme}
      onClick={onClick}
      borderRadius={borderRadius}
      {...rest}
    >
      {children}
    </ButtonStyle>
  );
};

const ButtonStyle = styled.button.withConfig({
  shouldForwardProp: (prop) =>
    ![
      'scheme',
      'buttonSize',
      'fontSize',
      'fontWeight',
      'borderRadius',
    ].includes(prop),
}) <Omit<Props, 'children'>>`
  font-size: ${({ theme, buttonSize, fontSize }) => (theme.buttonSize[buttonSize].fontSize ? theme.buttonSize[buttonSize].fontSize : theme.fontSize[fontSize ?? 'medium'])};
  padding: ${({ theme, buttonSize }) => theme.buttonSize[buttonSize].padding};
  width: ${({ theme, buttonSize }) => (theme.buttonSize[buttonSize].width ? theme.buttonSize[buttonSize].width : 'auto')};
  color: ${({ theme, scheme }) => theme.buttonScheme[scheme].color};
  background: ${({ theme, scheme }) =>
    theme.buttonScheme[scheme].gradation
      ? theme.buttonScheme[scheme].gradation // gradation이 있을 때 (primary, optionActive)
      : theme.buttonScheme[scheme].backgroundColor}; // 그 외 (primary가 아니거나 gradation이 없을 때)
  font-weight: ${({ theme, fontWeight }) => theme.fontWeight[fontWeight!]};
  border-radius: ${({ theme, borderRadius }) => theme.borderRadius[borderRadius!]};
  border: ${({ theme, scheme }) =>
    theme.buttonScheme[scheme].border
      ? `1px solid ${theme.buttonScheme[scheme].border}`
      : 'none'};
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ theme, scheme }) =>
    theme.buttonScheme[scheme].boxShadow
      ? theme.buttonScheme[scheme].boxShadow
      : 'none'};
  
  svg {
    stroke: ${({ theme, scheme }) => theme.buttonScheme[scheme].color};
  }


  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.color.primary};
  }
  
  ${hoverOverlay}
`;

export default Button;
