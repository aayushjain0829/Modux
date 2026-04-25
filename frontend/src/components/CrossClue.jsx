import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function CrossClue() {
  const { sessionId } = useParams()
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/cross-clue/${sessionId}`
    console.log('Attempting WebSocket connection to:', wsUrl)
    
    const websocket = new WebSocket(wsUrl)
    wsRef.current = websocket

    websocket.onopen = () => {
      console.log('✅ WebSocket connected successfully')
      console.log('Connection state:', websocket.readyState)
      setConnected(true)
    }

    websocket.onmessage = (event) => {
      console.log('📨 Message received:', event.data)
    }

    websocket.onclose = (event) => {
      console.log('❌ WebSocket disconnected')
      console.log('Close event code:', event.code, 'reason:', event.reason)
      setConnected(false)
    }

    websocket.onerror = (error) => {
      console.error('⚠️ WebSocket error occurred:', error)
      console.log('WebSocket state:', websocket.readyState)
      setConnected(false)
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close()
      }
    }
  }, [sessionId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '20px',
          color: '#333'
        }}>
          Cross Clue
        </h1>
        
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          borderRadius: '8px',
          background: connected ? '#d4edda' : '#f8d7da',
          color: connected ? '#155724' : '#721c24',
          fontWeight: '600',
          fontSize: '1.1rem'
        }}>
          Status: {connected ? 'Connected' : 'Disconnected'}
        </div>

        <div style={{
          color: '#666',
          fontSize: '0.95rem',
          marginBottom: '10px'
        }}>
          Session ID: <strong>{sessionId}</strong>
        </div>

        <p style={{
          color: '#999',
          fontSize: '0.9rem',
          marginTop: '20px'
        }}>
          Game interface coming soon...
        </p>
      </div>
    </div>
  )
}

export default CrossClue
