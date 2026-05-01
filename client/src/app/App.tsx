import { QueryClientProvider } from "@tanstack/react-query"
import { AppThemeProvider } from "./AppThemeProvider"
import Routers from "./Routers"
import { queryClient } from "./queryClient"


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <Routers />
      </AppThemeProvider>
    </QueryClientProvider>

  )
}

export default App
