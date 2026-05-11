import React from 'react'
import { useNavigate } from 'react-router-dom'

const BingoRecap = ({ gameState, userId, sendMessage, wsRef }) => {
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

  const winner = gameState.players[gameState.winner]
  const currentPlayer = gameState.players[userId]
  const isSpectator = currentPlayer?.is_spectator || false

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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Winner Announcement */}
        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            🎉 BINGO! 🎉
          </h1>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Winner: {winner?.username || 'Unknown Player'}
          </div>
        </div>

        {/* Final Board - hide for spectators */}
        {!isSpectator && currentPlayer?.board && (
          <div style={{
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: '#333',
              margin: '0 0 20px 0'
            }}>
              Your Final Board
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gameState.config?.grid_size || 5}, 50px)`,
              gridTemplateRows: `repeat(${gameState.config?.grid_size || 5}, 50px)`,
              gap: '4px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {currentPlayer.board.map((row, rowIndex) =>
                row.map((number, colIndex) => {
                  const isCalled = gameState.called_numbers.includes(number)
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      style={{
                        background: isCalled ? '#28a745' : 'white',
                        color: isCalled ? 'white' : '#333',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      {number}
                    </div>
                  )
                })
              )}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#666'
            }}>
              Lines Completed: {currentPlayer.lines_completed}/{(gameState.config?.grid_size || 5) * 2 + 2}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#667eea',
              marginBottom: '8px'
            }}>
              {gameState.called_numbers.length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Numbers Called
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#667eea',
              marginBottom: '8px'
            }}>
              {Object.keys(gameState.players).length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Players
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReturnToLobby}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '200px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea'
              e.target.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white'
              e.target.style.color = '#667eea'
            }}
          >
            <span>🏠</span>
            <span>Return to Lobby</span>
          </button>
          <button
            onClick={handleReturnToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '200px',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)'
            }}
          >
            <span>🎮</span>
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BingoRecap
