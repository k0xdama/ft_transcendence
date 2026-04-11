import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './main.css'
import App from './App.jsx'
import { LobbyProvider } from './context/LobbyContext.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { DMProvider } from './context/DMContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <LobbyProvider>
          <GameProvider>
            <ChatProvider>
              <DMProvider>
                <App />
              </DMProvider>
            </ChatProvider>
          </GameProvider>
        </LobbyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
