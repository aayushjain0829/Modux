import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function CrossClueLanding() {
  const navigate = useNavigate()
  const [joinSessionId, setJoinSessionId] = useState('')

  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const startSession = () => {
    const sessionId = generateSessionId()
    navigate(`/cross-clue/${sessionId}`)
  }

  const joinSession = () => {
    const sessionId = joinSessionId.trim().toUpperCase()
    if (sessionId) {
      navigate(`/cross-clue/${sessionId}`)
    }
  }

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
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '10px',
          color: '#333'
        }}>
          Cross Clue
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Cooperative Word Game
        </p>
        <button
          onClick={startSession}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Start New Session
        </button>

        <div style={{
          margin: '30px 0',
          borderBottom: '1px solid #e0e0e0'
        }} />

        <div style={{
          marginBottom: '15px',
          textAlign: 'left'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Join Existing Session
          </label>
          <input
            type="text"
            value={joinSessionId}
            onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
            placeholder="Enter Session ID"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              textTransform: 'uppercase',
              marginBottom: '10px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd'
            }}
          />
          <button
            onClick={joinSession}
            disabled={!joinSessionId.trim()}
            style={{
              background: joinSessionId.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: joinSessionId.trim() ? 'pointer' : 'not-allowed',
              transition: 'transform 0.2s, box-shadow 0.2s',
              width: '100%'
            }}
            onMouseOver={(e) => {
              if (joinSessionId.trim()) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrossClueLanding
