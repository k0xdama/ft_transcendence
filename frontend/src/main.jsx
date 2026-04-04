import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'
import { LobbyProvider } from './context/LobbyContext.jsx'
import { GameProvider } from './context/GameContext.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LobbyProvider>
          <GameProvider>
              <App />
          </GameProvider>
        </LobbyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
