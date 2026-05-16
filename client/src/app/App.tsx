import { QueryClientProvider } from "@tanstack/react-query"
import { AppThemeProvider } from "./AppThemeProvider"
import Routers from "./Routers"
import { queryClient } from "./queryClient"
import { useAuthInit } from "features/auth/model/hooks/useAuthInit"
import ToastProvider from "shared/ui/Toast/ToastProvider"
import Loading from "shared/ui/Loading/Loading"

function AppInner() {
  const { isInitializing } = useAuthInit();

  if (isInitializing) {
    return <Loading message="앱을 준비하는 중..." />
  }

  return <Routers />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AppInner />
        <ToastProvider />
      </AppThemeProvider>
    </QueryClientProvider>
  )
}

export default App
