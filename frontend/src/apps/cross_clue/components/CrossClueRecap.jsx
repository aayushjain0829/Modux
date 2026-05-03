import React from 'react'
import { useNavigate } from 'react-router-dom'

const CrossClueRecap = ({ gameState, userId, sendMessage, wsRef }) => {
  const navigate = useNavigate()

  const handleReturnToLobby = () => {
    sendMessage({
      action: 'return_to_lobby',
      user_id: userId
    })
  }

  const handleReturnToDashboard = () => {
    // Tell backend to remove player
    sendMessage({
      action: 'leave_game',
      user_id: userId
    })
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    // Navigate to dashboard
    navigate('/')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      borderRadius: '16px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#667eea',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          🎯 Cross Clue Complete!
        </h2>
        
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            Game Summary
          </h3>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Great teamwork! You've completed the Cross Clue challenge.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginTop: '20px'
          }}>
            <div style={{
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ color: '#667eea', fontWeight: '600', marginBottom: '5px' }}>
                Players
              </div>
              <div style={{ color: '#333', fontSize: '1.2rem' }}>
                {Object.keys(gameState.players || {}).length}
              </div>
            </div>
            <div style={{
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ color: '#667eea', fontWeight: '600', marginBottom: '5px' }}>
                Cards Left
              </div>
              <div style={{ color: '#333', fontSize: '1.2rem' }}>
                {gameState.deck?.length || 0}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReturnToLobby}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a67d8'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            <span>🔄</span>
            <span>Return to Lobby</span>
          </button>
          <button
            onClick={handleReturnToDashboard}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a6268'}
            onMouseOut={(e) => e.target.style.background = '#6c757d'}
          >
            <span>🏠</span>
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrossClueRecap;
