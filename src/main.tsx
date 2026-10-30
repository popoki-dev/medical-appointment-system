import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { storageService } from '@/services/storageService'
import './index.css'

// Seed the mock dataset into localStorage on first launch, before anything reads it.
storageService.initialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
