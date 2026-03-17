import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import './App.css'
import HomeView from './components/HomeView'
import CreateGameView from './components/lobby/CreateGameView'
import NavBar from './components/NavBar'
import RegisterView from './components/auth/RegisterView'
import LoginView from './components/auth/LoginView'
import JoinGameView from './components/lobby/JoinGameView'
import TestView from './components/gameboard/TestView'
import ProfileView from './components/ProfileView'

function App() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const {user, logout, isAuthenticated} = useAuth()

  useEffect(() => {
    fetch('/api/health')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        setBackendStatus(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

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
          <Route path="/test" element={<TestView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </div>
    </>
  )
}

export default App
