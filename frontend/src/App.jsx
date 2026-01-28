import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import HomeView from './components/HomeView'
import CreateGameView from './components/CreateGameView'

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
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/create" element={<CreateGameView />} />
    </Routes>
  )
}

export default App
