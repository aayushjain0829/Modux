import React from 'react'
import { useNavigate } from 'react-router-dom'

const BingoRecap = ({ gameState, userId, sendMessage }) => {
  const navigate = useNavigate()

  const handleReturnToLobby = () => {
    sendMessage({
      action: 'return_to_lobby',
      user_id: userId
    })
  }

  const handleReturnToDashboard = () => {
    // Tell backend to leave game (socket closes handled in main)
    sendMessage({
      action: 'leave_game',
      user_id: userId
    })
    
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
      gap: '24px',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
        {/* Winner Announcement */}
        <div style={{
          background: 'rgba(40, 167, 69, 0.2)',
          border: '1px solid rgba(40, 167, 69, 0.4)',
          color: 'var(--text-high)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(40, 167, 69, 0.15)'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--text-high)'
          }}>
            Winner: <span style={{ color: 'var(--accent-purple)' }}>{winner?.username || 'Unknown Player'}</span>
          </div>
        </div>

        {/* Final Board - hide for spectators */}
        {!isSpectator && currentPlayer?.board && (
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-high)',
              margin: '0 0 20px 0'
            }}>
              Your Final Board
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gameState.config?.grid_size || 5}, 1fr)`,
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
                        background: isCalled ? 'var(--accent-cyan)' : 'rgba(0,0,0,0.3)',
                        color: isCalled ? 'var(--bg-darker)' : 'var(--text-high)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1/1',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        fontFamily: 'var(--font-heading)'
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
              color: 'var(--text-medium)',
              fontWeight: '600'
            }}>
              Lines Completed: {currentPlayer.lines_completed}/{(gameState.config?.grid_size || 5) * 2 + 2}
            </div>
          </div>
        )}

    </div>
  )
}

export default BingoRecap
