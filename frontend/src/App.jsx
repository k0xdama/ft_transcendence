import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="app">
      <h1>Garou Loup</h1>
      
      <div className="status-card">
        <h2>Backend Connection</h2>
        {loading && <p>Connecting to backend...</p>}
        {error && <p className="error">Error: {error}</p>}
        {backendStatus && (
          <div className="success">
            <p>✓ Status: {backendStatus.status}</p>
            <p>Message: {backendStatus.message}</p>
            <p>Time: {new Date(backendStatus.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
