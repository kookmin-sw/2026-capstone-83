
import type { ReactNode } from "react";
import GlobalStyle from "shared/theme/global-style";
import { getTheme } from "shared/theme/theme";
import { ThemeProvider } from "styled-components";

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {

  return (
    <ThemeProvider theme={getTheme()}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};
