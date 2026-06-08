import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import GameGrid from '../../../components/common/GameGrid'

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

  // Calculate game duration using stored end time (timestamps are in seconds)
  const gameDuration = gameState?.game_start_time && gameState?.game_end_time
    ? Math.floor(gameState.game_end_time - gameState.game_start_time)
    : (gameState?.game_start_time ? Math.floor((Date.now() / 1000) - gameState.game_start_time) : 0)

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Render board cell with player name only
  const renderRecapCell = (row, col) => {
    const coordinate = `${String.fromCharCode(65 + row)}${col + 1}`
    const cellState = gameState?.grid_state?.[coordinate]
    const guesserId = gameState?.guess_history?.[coordinate]
    const guesserName = guesserId ? gameState?.players?.[guesserId]?.username || 'Unknown' : null
    
    const tileSize = window.innerWidth <= 768 ? 60 : 70
    const fontSize = window.innerWidth <= 768 ? '0.8rem' : '0.9rem'
    const nameFontSize = window.innerWidth <= 768 ? '0.6rem' : '0.7rem'
    const maxNameLength = window.innerWidth <= 768 ? 8 : 10

    return (
      <div
        key={coordinate}
        className={`modux-grid-cell ${cellState === 'success' ? 'success' : cellState === 'fail' ? 'fail' : 'not-clickable'}`}
        style={{
          cursor: 'default',
        }}
      >
        {guesserName && (
          <div style={{
            fontSize: nameFontSize,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.1',
            maxWidth: '90%',
            wordBreak: 'break-word',
            zIndex: 2,
            position: 'relative'
          }}>
            {guesserName.length > maxNameLength ? guesserName.substring(0, maxNameLength - 2) + '...' : guesserName}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Game Statistics */}
      <div className="stats-section">
        <div className="stats-grid">
          <div style={{
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
          }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '5px' }}>
              {gameState?.score || 0}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Correct
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
          }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '5px' }}>
              {gameState?.misses || 0}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Missed
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '5px' }}>
              {formatDuration(gameDuration)}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Duration
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
            color: 'white',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', marginBottom: '5px' }}>
              {Object.keys(gameState?.players || {}).length}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Players
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="stats-section" style={{
        background: 'rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto 30px',
        overflowX: 'auto',
        overflowY: 'visible'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-high)',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          📋 Final Board Results
        </h3>
        
        {/* Game Board Grid with Axes using GameGrid */}
        <GameGrid
          cols={4}
          rows={4}
          colHeaders={gameState?.col_words?.map((word, col) => (
            <div key={`col-${col}`} className="game-grid-header-pill" style={{ padding: '4px 0px' }}>
              <div className="cc-header-index">
                {col + 1}
              </div>
              <div className="cc-header-word vertical">
                {word}
              </div>
            </div>
          ))}
          rowHeaders={Array.from({ length: 4 }).map((_, row) => (
            <div key={`row-${row}`} className="game-grid-header-pill" style={{ padding: '4px 0px' }}>
              <div className="cc-header-index">
                {String.fromCharCode(65 + row)}
              </div>
              <div className="cc-header-word">
                {gameState?.row_words?.[row]}
              </div>
            </div>
          ))}
          renderCell={(row, col) => renderRecapCell(row, col)}
        />
      </div>
    </div>
  );
};

export default CrossClueRecap;
