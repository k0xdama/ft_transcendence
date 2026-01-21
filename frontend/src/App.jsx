import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(response => {
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers.get('content-type'))
        
        // First get the text to see what we received
        return response.text().then(text => {
          console.log('Raw response:', text)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${text}`)
          }
          
          // Try to parse as JSON
          try {
            return JSON.parse(text)
          } catch (e) {
            throw new Error(`Invalid JSON: ${text.substring(0, 100)}`)
          }
        })
      })
      .then(data => {
        setBackendStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Full error:', err)
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
