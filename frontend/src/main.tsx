import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme'
import './index.css'
import App from './App'

function Root() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleThemeChange = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <StrictMode>
      <ThemeProvider theme={getTheme(isDarkMode)}>
        <CssBaseline />
        <App isDarkMode={isDarkMode} toggleTheme={handleThemeChange} />
      </ThemeProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
