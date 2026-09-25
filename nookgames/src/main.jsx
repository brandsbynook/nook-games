import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { initRevenueCat } from './services/revenuecat.js'
import './index.css'
import App from './App.jsx'

registerSW({ immediate: true })

// Initialize RevenueCat SDK on launch
initRevenueCat().catch((err) => {
  console.warn('[RevenueCat] Initialization on launch error:', err)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
