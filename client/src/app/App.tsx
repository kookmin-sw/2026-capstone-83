import { AppThemeProvider } from "./AppThemeProvider"
import Routers from "./Routers"


function App() {

  return (
    <AppThemeProvider>
      <Routers />
    </AppThemeProvider>
  )
}

export default App
