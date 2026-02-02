import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import HomeView from './components/HomeView'
import CreateGameView from './components/CreateGameView'
import NavBar from './components/NavBar'
import RegisterView from './components/RegisterView'
import LoginView from './components/LoginView'
import JoinGameView from './components/JoinGameView'
import TestView from './components/TestView'

function App() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('home')

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
        </Routes>
      </div>
    </>
  )
}

export default App
