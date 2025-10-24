import { useState } from 'react'
import CRMInterface from './components/CRMInterface'
import LoginScreen from './components/LoginScreen'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // For demo purposes, skip authentication
  const handleDemoLogin = () => {
    setUser({ name: 'Demo User', email: 'demo@wefixico.com' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onDemoLogin={handleDemoLogin} />
  }

  return <CRMInterface />
}

export default App