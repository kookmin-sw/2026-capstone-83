import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from 'shared/theme/theme';
import type { ReactElement } from 'react';

const theme = getTheme();

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    ),
    ...options,
  });
}
