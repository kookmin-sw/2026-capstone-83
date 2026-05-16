import { QueryClientProvider } from "@tanstack/react-query"
import { AppThemeProvider } from "./AppThemeProvider"
import Routers from "./Routers"
import { queryClient } from "./queryClient"
import { useAuthInit } from "features/auth/model/hooks/useAuthInit"
import { useAuthStore } from "entities/auth/model/store/authStore"
import { useNotificationSSE } from "entities/notification/model/hooks/useNotificationSSE"
import ToastProvider from "shared/ui/Toast/ToastProvider"
import Loading from "shared/ui/Loading/Loading"

function AppInner() {
  const { isInitializing } = useAuthInit();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // SSE 실시간 알림 구독 (훅 내부에서 로그인 여부 체크)
  useNotificationSSE(isLoggedIn);

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
