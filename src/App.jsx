import { useState } from 'react'
import AppRouter from './components/AppRouter'

function App() {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return <AppRouter theme={theme} toggleTheme={toggleTheme} />
}

export default App
