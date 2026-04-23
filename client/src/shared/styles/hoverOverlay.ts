import { css } from 'styled-components';

export const hoverOverlay = css`
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ theme }) => theme.color.hoverOverlay};
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  &:hover::after {
    opacity: 0.1;
  }
`;
