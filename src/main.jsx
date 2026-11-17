import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DonneesProvider } from './lib/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DonneesProvider>
      <App />
    </DonneesProvider>
  </StrictMode>,
)
