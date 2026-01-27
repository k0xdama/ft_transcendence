import { useState, useEffect } from 'react'
import './App.css'

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

  const HomeView = () => (
    <div className='homeView'>
      <h1>Garou Loup</h1>
      <p>"Prends gare au loup"</p>
      <div className='buttonContainer'>
        <button className='createBut'>Create</button>
        <button className='But'>Join</button>
        <button className='But'>Test Game</button>
      </div>
    </div>
  );
 return (
  <>
    {currentView === 'home' && <HomeView />}
  </>
 )
}

export default App
