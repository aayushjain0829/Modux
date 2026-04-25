import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function CrossClue() {
  const { sessionId } = useParams()
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [secretCard, setSecretCard] = useState(null)
  const [userId, setUserId] = useState('')
  const wsRef = useRef(null)

  // Helper function to get or generate unique user ID
  const getUserId = () => {
    let id = sessionStorage.getItem('modux_user_id')
    if (!id) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      id = result
      sessionStorage.setItem('modux_user_id', id)
    }
    return id
  }

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageWithUserId = { ...message, user_id: userId }
      wsRef.current.send(JSON.stringify(messageWithUserId))
    }
  }

  useEffect(() => {
    // Initialize user ID on component mount
    const id = getUserId()
    setUserId(id)

    const wsUrl = `ws://${window.location.hostname}:8000/ws/cross-clue/${sessionId}`
    
    const websocket = new WebSocket(wsUrl)
    wsRef.current = websocket

    websocket.onopen = () => {
      setConnected(true)
    }

    websocket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        
        // Handle card_drawn messages (private secret card)
        if (parsed.type === 'card_drawn') {
          const coordinate = parsed.data.coordinate
          setSecretCard(coordinate)
        }
        // Handle secret_update messages (alternative private secret card format)
        else if (parsed.type === 'secret_update') {
          const coordinate = parsed.secret_card
          setSecretCard(coordinate)
        }
        // Handle public state updates (don't overwrite secretCard)
        else {
          setGameState(parsed)
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    websocket.onclose = () => {
      setConnected(false)
    }

    websocket.onerror = () => {
      setConnected(false)
    }

    return () => {
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center'
        }}>
          Cross Clue - WebSocket Inspector
        </h1>
        
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          borderRadius: '8px',
          background: connected ? '#d4edda' : '#f8d7da',
          color: connected ? '#155724' : '#721c24',
          fontWeight: '600',
          fontSize: '1.1rem',
          textAlign: 'center'
        }}>
          Status: {connected ? 'Connected' : 'Disconnected'}
        </div>

        <div style={{
          color: '#666',
          fontSize: '0.95rem',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Session ID: <strong>{sessionId}</strong>
        </div>

        <div style={{
          color: '#666',
          fontSize: '0.95rem',
          marginBottom: '20px',
          textAlign: 'center',
          padding: '10px',
          background: '#e9ecef',
          borderRadius: '8px'
        }}>
          Your User ID: <strong style={{ color: '#667eea' }}>{userId}</strong>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => sendMessage({ action: 'init_game' })}
            disabled={!connected}
            style={{
              padding: '12px',
              background: connected ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            Initialize Game
          </button>
          <button
            onClick={() => sendMessage({ action: 'draw_card' })}
            disabled={!connected}
            style={{
              padding: '12px',
              background: connected ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            Draw Card
          </button>
          <button
            onClick={() => sendMessage({ action: 'submit_clue', clue: 'TestClue' })}
            disabled={!connected}
            style={{
              padding: '12px',
              background: connected ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            Submit Clue
          </button>
          <button
            onClick={() => sendMessage({ action: 'guess_coordinate', guess: 'A1' })}
            disabled={!connected}
            style={{
              padding: '12px',
              background: connected ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            Guess A1
          </button>
        </div>

        <div style={{
          background: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          <pre style={{
            margin: 0,
            fontSize: '0.85rem',
            fontFamily: 'monospace'
          }}>
            {gameState || secretCard ? JSON.stringify({ ...gameState, secret_card_debug: secretCard }, null, 2) : 'No data received yet...'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CrossClue
