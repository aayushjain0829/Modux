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
      padding: '20px',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}>
        {/* Game Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
              {gameState?.score || 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Correct Guesses
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
              {gameState?.misses || 0}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Missed Guesses
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
              {formatDuration(gameDuration)}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Game Duration
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
              {Object.keys(gameState?.players || {}).length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Players
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
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
            <div key={`col-${col}`} className="game-grid-header-pill" style={{ padding: '4px 2px', cursor: window.innerWidth <= 768 ? 'pointer' : 'default' }}
            onClick={() => {
              if (window.innerWidth <= 768) {
                toast(`Column ${col + 1}: ${word}`, { icon: '📝' });
              }
            }}>
              <div style={{ 
                fontSize: '0.65rem', 
                fontWeight: '600', 
                opacity: 0.9, 
                marginBottom: '1px' 
              }}>
                {col + 1}
              </div>
              {window.innerWidth > 768 && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '700', 
                  lineHeight: '1.2' 
                }}>
                  {word}
                </div>
              )}
            </div>
          ))}
          rowHeaders={Array.from({ length: 4 }).map((_, row) => (
            <div key={`row-${row}`} className="game-grid-header-pill" style={{ padding: '4px 2px', cursor: window.innerWidth <= 768 ? 'pointer' : 'default' }}
            onClick={() => {
              if (window.innerWidth <= 768) {
                toast(`Row ${String.fromCharCode(65 + row)}: ${gameState?.row_words?.[row]}`, { icon: '📝' });
              }
            }}>
              <div style={{ 
                fontSize: '0.65rem', 
                opacity: 0.9, 
                marginBottom: '1px' 
              }}>
                {String.fromCharCode(65 + row)}
              </div>
              {window.innerWidth > 768 && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  marginTop: '1px' 
                }}>
                  {gameState?.row_words?.[row]}
                </div>
              )}
            </div>
          ))}
          renderCell={(row, col) => renderRecapCell(row, col)}
        />
      </div>
    </div>
  );
};

export default CrossClueRecap;
