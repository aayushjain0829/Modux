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
        style={{
          width: `${tileSize}px`,
          height: `${tileSize}px`,
          border: cellState ? 'none' : '2px solid #ddd',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          fontSize: fontSize,
          fontWeight: '600',
          transition: 'all 0.2s ease',
          background: cellState === 'success' 
            ? 'linear-gradient(135deg, #28a745, #20c997)'
            : cellState === 'fail'
            ? 'linear-gradient(135deg, #dc3545, #c82333)'
            : '#fafafa',
          color: cellState ? 'white' : '#333',
          boxShadow: cellState 
            ? cellState === 'success'
              ? '0 4px 15px rgba(40, 167, 69, 0.3)'
              : '0 4px 15px rgba(220, 53, 69, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
      >
        {guesserName && (
          <div style={{
            fontSize: nameFontSize,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.1',
            maxWidth: '90%',
            wordBreak: 'break-word'
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
        <h2 style={{
          color: '#667eea',
          marginBottom: '20px',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          🎯 Cross Clue Complete!
        </h2>
        
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
        background: 'rgba(255, 255, 255, 0.95)',
        padding: window.innerWidth <= 768 ? '15px' : '25px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto 30px',
        overflowX: 'auto',
        overflowY: 'visible'
      }}>
        <h3 style={{
          color: '#667eea',
          marginBottom: '20px',
          fontSize: '1.5rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          📋 Final Board Results
        </h3>
        
        {/* Game Board Grid with Axes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 
            ? '60px repeat(4, 60px)' 
            : '80px repeat(4, 70px)',
          gridTemplateRows: window.innerWidth <= 768 
            ? '40px repeat(4, 60px)' 
            : '50px repeat(4, 70px)',
          gap: window.innerWidth <= 768 ? '6px' : '8px',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'fit-content',
          margin: '0 auto',
          minWidth: 'max-content'
        }}>
          {/* Empty corner */}
          <div></div>
          
          {/* Column Headers */}
          {gameState?.col_words?.map((word, col) => (
            <div key={`col-${col}`} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: window.innerWidth <= 768 ? '6px 2px' : '8px 4px',
              borderRadius: '20px',
              fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.85rem',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              minHeight: window.innerWidth <= 768 ? '35px' : '40px',
              wordBreak: 'break-word',
              overflow: 'hidden',
              margin: window.innerWidth <= 768 ? '2px' : '0'
            }}>
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.75rem', 
                fontWeight: '600', 
                opacity: 0.9, 
                marginBottom: '1px' 
              }}>
                {col + 1}
              </div>
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem', 
                fontWeight: '700', 
                lineHeight: '1.2' 
              }}>
                {word}
              </div>
            </div>
          ))}
          
          {/* Grid Rows with Row Headers */}
          {Array.from({ length: 4 }, (_, row) => (
            <React.Fragment key={`row-${row}`}>
              {/* Row Header */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: window.innerWidth <= 768 ? '6px 2px' : '8px 4px',
                borderRadius: '20px',
                fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.85rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                minHeight: window.innerWidth <= 768 ? '35px' : '40px',
                wordBreak: 'break-word',
                overflow: 'hidden',
                margin: window.innerWidth <= 768 ? '2px' : '0',
                lineHeight: '1.2'
              }}>
                <div style={{ 
                  fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.75rem', 
                  opacity: 0.9, 
                  marginBottom: '1px' 
                }}>
                  {String.fromCharCode(65 + row)}
                </div>
                <div style={{ 
                  fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem', 
                  marginTop: '1px' 
                }}>
                  {gameState?.row_words?.[row]}
                </div>
              </div>
              
              {/* Grid Cells */}
              {Array.from({ length: 4 }, (_, col) => renderRecapCell(row, col))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '20px'
      }}>
        <button
          onClick={handleReturnToLobby}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          🔄 Play Again
        </button>
        <button
          onClick={handleReturnToDashboard}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #6c757d, #5a6268)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)'
          }}
        >
          🏠 Dashboard
        </button>
      </div>
    </div>
  );
};

export default CrossClueRecap;
