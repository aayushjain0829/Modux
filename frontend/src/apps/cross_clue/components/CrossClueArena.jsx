import React, { useState, useEffect, useRef } from 'react'

function CrossClueArena({ gameState, userId, sendMessage, secretCard }) {
  const [clueInput, setClueInput] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [guessResult, setGuessResult] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const timeoutRef = useRef(null)

  // Timer effect
  useEffect(() => {
    if (gameState?.action_deadline && gameState?.status === 'playing') {
      const updateTimer = () => {
        const now = Date.now()
        const deadline = gameState.action_deadline * 1000 // Convert to milliseconds
        const remaining = Math.max(0, deadline - now)
        
        setTimeRemaining(remaining)
        
        // Auto-send timeout if user is active role and time hits 0
        if (remaining === 0 && (
          (gameState.turn_phase === 'giving_clue' && gameState.active_giver_id === userId) ||
          (gameState.turn_phase === 'guessing' && gameState.active_guesser_id === userId)
        )) {
          sendMessage({
            action: 'action_timeout',
            user_id: userId
          })
        }
      }
      
      updateTimer()
      timeoutRef.current = setInterval(updateTimer, 100)
      
      return () => {
        if (timeoutRef.current) {
          clearInterval(timeoutRef.current)
        }
      }
    } else {
      setTimeRemaining(null)
    }
  }, [gameState?.action_deadline, gameState?.turn_phase, gameState?.active_giver_id, gameState?.active_guesser_id, userId, sendMessage])

  // Timer calculations
  const timeRemainingCalc = gameState?.action_deadline 
    ? Math.max(0, Math.floor((gameState.action_deadline * 1000) - Date.now()))
    : null

  // Game timer calculations
  const gameStartTime = gameState?.game_start_time 
    ? gameState.game_start_time * 1000 
    : Date.now() // Fallback to current time if not set
  const gameDuration = (gameState?.game_timer || 300) * 1000 // Convert to milliseconds
  const gameTimerRemaining = gameState?.status === 'playing' 
    ? Math.max(0, Math.floor((gameStartTime + gameDuration) - Date.now()))
    : 0

  // Game timer expiration check
  useEffect(() => {
    if (gameState?.status === 'playing' && gameTimerRemaining <= 0) {
      // Game timer expired, move to recap stage
      sendMessage({
        action: 'game_timeout',
        user_id: userId
      })
    }
  }, [gameTimerRemaining, gameState?.status, userId, sendMessage])

  // Format time display
  const formatTime = (ms) => {
    if (ms === null) return null
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  // Determine user role
  const isGiver = gameState?.active_giver_id === userId
  const isGuesser = gameState?.active_guesser_id === userId
  const isVoter = !isGiver && !isGuesser && gameState?.status === 'playing'

  // Handle clue submission
  const handleClueSubmit = (e) => {
    e.preventDefault()
    if (clueInput.trim()) {
      sendMessage({
        action: 'submit_clue',
        user_id: userId,
        clue: clueInput.trim()
      })
      setClueInput('')
    }
  }

  // Handle cell click - Role-based actions (no phase restrictions for local games)
  const handleCellClick = (coordinate) => {
    if (isGuesser && gameState?.status === 'playing') {
      // Guesser submits a guess
      sendMessage({
        action: 'guess_coordinate',
        user_id: userId,
        coordinate: coordinate
      })
    } else if (isVoter && gameState?.status === 'playing') {
      // Voter submits a vote
      sendMessage({
        action: 'submit_vote',
        user_id: userId,
        coordinate: coordinate
      })
    }
  }

  // Get cell state from game state
  const getCellState = (row, col) => {
    const coordinate = `${String.fromCharCode(65 + row)}${col + 1}`
    const cellState = gameState?.grid_state?.[coordinate]
    
    // Check if cell is marked as success/fail
    if (cellState === 'success') {
      return { revealed: true, isSuccess: true, votes: [] }
    } else if (cellState === 'fail') {
      return { revealed: true, isSuccess: false, votes: [] }
    }
    
    // Get votes for this coordinate
    const cellVotes = Object.entries(gameState?.votes || {})
      .filter(([_, coord]) => coord === coordinate)
      .map(([userId, _]) => userId)
    
    return { revealed: false, isSuccess: false, votes: cellVotes }
  }

  // Render grid cell - Tactile Game Tiles with Role-Based Interactivity
  const renderCell = (row, col) => {
    const coordinate = `${String.fromCharCode(65 + row)}${col + 1}`
    const cellState = getCellState(row, col)
    
    // Determine if cell is clickable based on role (no phase restrictions for local games)
    const isClickable = !cellState.revealed && (
      (isGuesser && gameState?.status === 'playing') ||
      (isVoter && gameState?.status === 'playing')
    )
    
    // Determine cell background based on state
    const getBackground = () => {
      if (cellState.revealed) {
        if (cellState.isSuccess) {
          return 'linear-gradient(135deg, #28a745, #20c997)'
        } else {
          return 'linear-gradient(135deg, #dc3545, #c82333)'
        }
      }
      return '#fafafa'
    }
    
    // Mobile-responsive sizing
    const isMobile = window.innerWidth <= 768
    const tileSize = isMobile ? 50 : 70
    const fontSize = isMobile ? '0.8rem' : '1.1rem'
    const coordinateFontSize = isMobile ? '0.7rem' : '1rem'
    
    return (
      <div
        key={coordinate}
        onClick={() => isClickable && handleCellClick(coordinate)}
        style={{
          width: `${tileSize}px`,
          height: `${tileSize}px`,
          border: cellState.revealed 
            ? 'none' 
            : isClickable
              ? '3px solid rgba(102, 126, 234, 0.5)'
              : '3px solid rgba(102, 126, 234, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackground(),
          cursor: isClickable ? 'pointer' : (cellState.revealed ? 'default' : 'not-allowed'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: fontSize,
          fontWeight: cellState.revealed ? '700' : '600',
          color: cellState.revealed ? 'white' : '#667eea',
          borderRadius: '12px',
          boxShadow: cellState.revealed
            ? (cellState.isSuccess 
                ? '0 4px 15px rgba(40, 167, 69, 0.4)' 
                : '0 4px 15px rgba(220, 53, 69, 0.4)')
            : isClickable
              ? '0 4px 12px rgba(102, 126, 234, 0.2)'
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: cellState.revealed ? 'scale(0.95)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
          opacity: (!isClickable && !cellState.revealed) ? 0.7 : 1
        }}
        onMouseOver={(e) => {
          if (isClickable && !isMobile) {
            e.target.style.backgroundColor = '#f0f4ff';
            e.target.style.borderColor = '#667eea';
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
          }
        }}
        onMouseOut={(e) => {
          if (isClickable && !isMobile) {
            e.target.style.backgroundColor = '#fafafa';
            e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
          }
        }}
        onMouseDown={(e) => {
          if (isClickable) {
            e.target.style.transform = 'translateY(-1px) scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (isClickable) {
            e.target.style.transform = isMobile ? 'scale(0.95)' : 'translateY(-3px) scale(1.02)';
          }
        }}
      >
        {cellState.revealed ? (
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: '800',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {cellState.isSuccess ? '✓' : '✗'}
          </div>
        ) : (
          <div style={{
            fontSize: coordinateFontSize,
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            {coordinate}
          </div>
        )}
        
        {/* Vote Badge */}
        {cellState.votes && cellState.votes.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: 'rgba(102, 126, 234, 0.9)',
            color: 'white',
            borderRadius: '8px',
            padding: '1px 4px',
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            fontWeight: '700',
            minWidth: isMobile ? '14px' : '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            {cellState.votes.length}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      padding: '10px',
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box'
    }}>
      {/* Game Timer Component */}
      <div style={{
        background: gameTimerRemaining < 30000 
          ? 'linear-gradient(135deg, #dc3545, #c82333)' 
          : 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '15px',
        marginBottom: '15px',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: '1.1rem',
        boxShadow: gameTimerRemaining < 30000
          ? '0 4px 15px rgba(220, 53, 69, 0.4)'
          : '0 4px 15px rgba(255, 107, 107, 0.3)',
        animation: gameTimerRemaining < 30000 ? 'pulse 1s infinite' : 'none'
      }}>
        ⏱️ Game Time: {formatTime(gameTimerRemaining)}
      </div>

      {/* Turn Timer Component */}
      {timeRemainingCalc !== null && (
        <div style={{
          background: timeRemainingCalc < 10000 
            ? 'linear-gradient(135deg, #dc3545, #c82333)' 
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '15px',
          marginBottom: '15px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '1.2rem',
          boxShadow: timeRemainingCalc < 10000
            ? '0 4px 15px rgba(220, 53, 69, 0.4)'
            : '0 4px 15px rgba(102, 126, 234, 0.3)',
          animation: timeRemainingCalc < 10000 ? 'pulse 1s infinite' : 'none'
        }}>
          {(() => {
            const activeGiver = gameState?.players?.[gameState?.active_giver_id]
            const activeGuesser = gameState?.players?.[gameState?.active_guesser_id]
            const giverName = activeGiver?.username || 'Unknown Player'
            const guesserName = activeGuesser?.username || 'Unknown Player'
            
            return `🎯 ${giverName} → ${guesserName}: ${formatTime(timeRemainingCalc)}`
          })()}
        </div>
      )}

      {/* Secret Card Reminder */}
      {secretCard && gameState?.active_giver_id === userId && gameState?.turn_phase === 'giving_clue' && gameState?.active_turn?.secret_coordinate === secretCard && (
        <div style={{
          background: 'linear-gradient(135deg, #28a745, #20c997)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          marginBottom: '15px',
          textAlign: 'center',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
        }}>
          🎴 Your Secret: {secretCard}
        </div>
      )}

      {/* Main Game Board */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: window.innerWidth <= 768 ? '15px' : '25px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        overflowX: 'auto',
        overflowY: 'visible'
      }}>
        {/* Game Board Grid with Axes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 
            ? '50px repeat(4, 50px)' 
            : '80px repeat(4, 70px)',
          gridTemplateRows: window.innerWidth <= 768 
            ? '35px repeat(4, 50px)' 
            : '50px repeat(4, 70px)',
          gap: window.innerWidth <= 768 ? '4px' : '8px',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'fit-content',
          margin: '0 auto',
          minWidth: 'max-content'
        }}>
          {/* Empty corner */}
          <div></div>
          
          {/* Column Headers - Pill Shaped */}
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
              {/* Row Header - Pill Shaped */}
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
              
              {/* Grid Cells - Tactile Tiles */}
              {Array.from({ length: 4 }, (_, col) => renderCell(row, col))}
            </React.Fragment>
          ))}
        </div>

        </div>

      {/* Role-Based Control Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: window.innerWidth <= 768 ? '20px 15px' : '25px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '500px',
        marginTop: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Giver View */}
        {isGiver && gameState?.turn_phase === 'giving_clue' && (
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#667eea',
              marginBottom: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🎯 {gameState?.active_turn?.secret_coordinate === secretCard 
                ? `You are giving a clue for: ${secretCard}`
                : 'Draw a card to start your turn!'}
            </h3>
            
            {gameState?.active_turn?.secret_coordinate === secretCard && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: window.innerWidth <= 768 ? '15px' : '20px',
                borderRadius: '15px',
                border: '2px solid rgba(102, 126, 234, 0.2)'
              }}>
                <form onSubmit={handleClueSubmit}>
                  <div style={{ 
                    display: 'flex', 
                    gap: window.innerWidth <= 768 ? '8px' : '12px',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                  }}>
                    <input
                      type="text"
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      placeholder="Enter a one-word clue..."
                      style={{
                        flex: 1,
                        padding: window.innerWidth <= 768 ? '10px 12px' : '12px 16px',
                        border: '2px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '10px',
                        fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                        background: 'white',
                        transition: 'border-color 0.3s ease',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.outline = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: window.innerWidth <= 768 ? '10px 16px' : '12px 20px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        minWidth: window.innerWidth <= 768 ? '100px' : 'auto'
                      }}
                      onMouseOver={(e) => {
                        if (window.innerWidth > 768) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (window.innerWidth > 768) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }
                      }}
                    >
                      Submit Clue
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {(!gameState?.active_turn?.secret_coordinate || gameState?.active_turn?.secret_coordinate !== secretCard) && (
              <button
                onClick={() => sendMessage({
                  action: 'draw_card',
                  user_id: userId
                })}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.3)';
                }}
              >
                🎴 Draw Card
              </button>
            )}
          </div>
        )}

        {/* Guesser View */}
        {isGuesser && gameState?.turn_phase === 'guessing' && (
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#667eea',
              marginBottom: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🎯 You are guessing! Click a tile based on the clue.
            </h3>
            
            {gameState?.current_clue && (
              <div style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                padding: window.innerWidth <= 768 ? '12px 20px' : '15px 25px',
                borderRadius: '15px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                width: '100%',
                boxSizing: 'border-box',
                wordBreak: 'break-word'
              }}>
                💡 Clue: {gameState.current_clue}
              </div>
            )}
            
            {!gameState?.current_clue && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                padding: window.innerWidth <= 768 ? '12px 20px' : '15px 25px',
                borderRadius: '15px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                🎧 Waiting for clue...
              </div>
            )}
          </div>
        )}

        {/* Voter View */}
        {isVoter && (
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              color: '#667eea',
              marginBottom: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🗳️ Vote for the correct coordinate!
            </h3>
            
            {gameState?.current_clue && (
              <div style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                padding: window.innerWidth <= 768 ? '12px 20px' : '15px 25px',
                borderRadius: '15px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                width: '100%',
                boxSizing: 'border-box',
                wordBreak: 'break-word'
              }}>
                💡 Clue: {gameState.current_clue}
              </div>
            )}
            
            <div style={{
              background: 'rgba(102, 126, 234, 0.05)',
              padding: '15px 20px',
              borderRadius: '15px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Click on a tile to vote for what you think is the secret coordinate.
            </div>
          </div>
        )}

        {/* Score Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '15px',
          border: '2px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#28a745' }}>
              {gameState?.score || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc3545' }}>
              {gameState?.misses || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Misses</div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      {guessResult && (
        <div style={{
          background: guessResult.correct 
            ? 'linear-gradient(135deg, #28a745, #20c997)' 
            : 'linear-gradient(135deg, #dc3545, #c82333)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '15px',
          marginTop: '20px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '1.1rem',
          boxShadow: `0 4px 15px ${guessResult.correct ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`
        }}>
          {guessResult.correct ? '🎉 Correct!' : '❌ Try again!'}
        </div>
      )}
    </div>
  )
}

export default CrossClueArena
