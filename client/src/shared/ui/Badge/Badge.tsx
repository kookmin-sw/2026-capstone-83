import React from 'react';
import type { BadgeScheme, FontSizeKey } from 'shared/types/theme';
import styled from 'styled-components'


export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';

interface Props {
  children: React.ReactNode;
  scheme?: BadgeScheme;
  fontSize?: FontSizeKey;
}

const Badge = ({ children, scheme = 'primary', fontSize }: Props) => {
  return (
    <BadgeStyle scheme={scheme} fontSize={fontSize}>
      {children}
    </BadgeStyle>
  );
};

export const BadgeStyle = styled.span<Props>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 8px; 
  font-size: ${({ theme, fontSize }) => (fontSize ? theme.fontSize[fontSize] : theme.fontSize.xsmall)};
  color: ${({ theme, scheme }) => theme.badgeScheme[scheme!].color};
  background-color: ${({ theme, scheme }) => theme.badgeScheme[scheme!].backgroundColor};
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
`;

export default Badge;






