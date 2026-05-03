import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../../../context/UserContext'

function CrossClueSetup({ gameState, userId, sendMessage, onTransitionToArena }) {
  const navigate = useNavigate()
  const { username } = useUser()
  
  // Setup-specific state for Cross Clue
  const [isReady, setIsReady] = useState(false)
  const [secretCard, setSecretCard] = useState(null)
  const wsRef = useRef(null)

  // Handle receiving secret card
  useEffect(() => {
    if (gameState?.secret_card) {
      setSecretCard(gameState.secret_card)
    }
  }, [gameState])

  // Handle ready toggle
  const handleToggleReady = () => {
    setIsReady(!isReady)
    // Send ready state to backend
    sendMessage({
      type: 'toggle_ready',
      user_id: userId,
      is_ready: !isReady
    })
  }

  // Handle start game (host only)
  const handleStartGame = () => {
    sendMessage({
      type: 'start_game',
      user_id: userId
    })
  }

  // Check if user is host
  const isHost = gameState?.host_id === userId

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
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '20px',
          color: '#333'
        }}>
          Cross Clue Setup
        </h1>
        
        <p style={{
          fontSize: '1rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Prepare for your cooperative word-association game
        </p>

        {/* Secret Card Display */}
        {secretCard && (
          <div style={{
            background: '#f8f9fa',
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#667eea',
              marginBottom: '10px',
              fontSize: '1.1rem'
            }}>
              Your Secret Coordinate
            </h3>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'monospace'
            }}>
              {secretCard}
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: '#666',
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              Keep this secret! Guide others to this coordinate using one-word clues.
            </p>
          </div>
        )}

        {/* Game Settings */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{
            color: '#333',
            marginBottom: '15px',
            fontSize: '1.1rem'
          }}>
            Game Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Grid Size:</span>
              <span style={{ fontWeight: '600' }}>5x5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Players:</span>
              <span style={{ fontWeight: '600' }}>{Object.keys(gameState?.players || {}).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Mode:</span>
              <span style={{ fontWeight: '600' }}>Cooperative</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleToggleReady}
            style={{
              flex: 1,
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: isReady ? '#dc3545' : '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {isReady ? 'Not Ready' : 'I am Ready'}
          </button>
          
          {isHost && (
            <button
              onClick={handleStartGame}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrossClueSetup
