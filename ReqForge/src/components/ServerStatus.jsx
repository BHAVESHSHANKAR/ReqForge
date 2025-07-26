import React, { useState, useEffect } from 'react'
import { healthCheck } from '../services/api'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

function ServerStatus() {
  const [status, setStatus] = useState('checking') // 'checking', 'online', 'offline'
  const [serverInfo, setServerInfo] = useState(null)

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await healthCheck()
        setStatus('online')
        setServerInfo(response)
      } catch (error) {
        setStatus('offline')
        console.error('Server health check failed:', error)
      }
    }

    checkServerStatus()
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-2">
        <Loader className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600">Checking server...</span>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 border rounded-lg shadow-lg p-3 flex items-center space-x-2 ${
      status === 'online' 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      {status === 'online' ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700">Server Online</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">Server Offline</span>
        </>
      )}
    </div>
  )
}

export default ServerStatus