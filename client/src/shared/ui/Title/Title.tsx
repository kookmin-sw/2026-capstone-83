import React, { type ReactNode } from 'react'
import styled from 'styled-components';
import type { ColorKey, FontSizeKey } from 'shared/types/theme';

interface Props {
  children: ReactNode;
  fontSize: FontSizeKey;
  color?: ColorKey;
}

const Title = ({ children, fontSize, color }: Props) => {
  return (
    <TitleStyle fontSize={fontSize} color={color}>
      {children}
    </TitleStyle>
  )
}

const TitleStyle = styled.h1<Omit<Props, "children">>`
    font-size: ${({ theme, fontSize }) => theme.fontSize[fontSize]};
    color: ${({ theme, color }) => (color ? theme.color[color] : theme.color.text)};
`;

export default Title;