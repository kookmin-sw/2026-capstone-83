import { QueryClientProvider } from "@tanstack/react-query"
import { AppThemeProvider } from "./AppThemeProvider"
import Routers from "./Routers"
import { queryClient } from "./queryClient"
import { useAuthInit } from "features/auth/model/hooks/useAuthInit"

function AppInner() {
  const { isInitializing } = useAuthInit();

  if (isInitializing) {
    return <div>로딩 중</div>
  }

  return (
    <AppThemeProvider>
      <Routers />
    </AppThemeProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export default App
