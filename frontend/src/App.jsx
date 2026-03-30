import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import HomeView from './components/HomeView'
import CreateGameView from './components/lobby/CreateGameView'
import NavBar from './components/NavBar'
import RegisterView from './components/auth/RegisterView'
import LoginView from './components/auth/LoginView'
import JoinGameView from './components/lobby/JoinGameView'
import ProfileView from './components/ProfileView'
import LobbyView from './components/lobby/LobbyView'
import GameView from './components/gameboard/GameView'
import PublicMatchmakingView from './components/matchmaking/PublicMatchmakingView'
import './App.css'

function App() {
  const [ backendStatus, setBackendStatus ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState(null)
  const [ currentView, setCurrentView ] = useState('home')
  const { user, logout, isAuthenticated } = useAuth()

  const handleNav = (viewName) => {
    setCurrentView(viewName)
  }

  return (
    <>
      <NavBar />

      <div className='main-container'>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/create" element={<CreateGameView />} />
          <Route path="/join" element={<JoinGameView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/lobby/:lobbyId" element={<LobbyView />} />
          <Route path="/game/:gameId" element={<GameView />} />
          <Route path="/matchmaking" element={<PublicMatchmakingView />} />
        </Routes>
      </div>
    </>
  )
}

export default App
