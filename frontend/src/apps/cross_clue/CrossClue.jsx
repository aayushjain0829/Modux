import { useParams } from 'react-router-dom'
import React, { useState, useEffect, useRef } from 'react'

function CrossClue() {
  const { sessionId } = useParams()
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [secretCard, setSecretCard] = useState(null)
  const [userId, setUserId] = useState('')
  const [clueInput, setClueInput] = useState('')
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
        // Handle state_update messages (public game state)
        else if (parsed.type === 'state_update' && parsed.data) {
          setGameState(parsed.data)
        }
        // Handle guess_result messages
        else if (parsed.type === 'guess_result' && parsed.data) {
          setGameState(prev => ({
            ...prev,
            grid_state: parsed.data.grid_state
          }))
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

  const handleGuess = (coordinate) => {
    sendMessage({ action: 'guess_coordinate', guess: coordinate })
  }

  const handleDrawCard = () => {
    sendMessage({ action: 'draw_card' })
  }

  const handleSubmitClue = () => {
    if (clueInput.trim()) {
      sendMessage({ action: 'submit_clue', clue: clueInput.trim() })
      setClueInput('')
    }
  }

  const handleInitGame = () => {
    sendMessage({ action: 'init_game' })
  }

  // Generate grid coordinates
  const rows = ['A', 'B', 'C', 'D']
  const cols = ['1', '2', '3', '4']

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .game-title {
            font-size: 1.4rem !important;
          }
          .grid-cell {
            padding: 8px !important;
            font-size: 0.75rem !important;
            min-width: 45px !important;
            min-height: 45px !important;
          }
          .grid-header {
            font-size: 0.65rem !important;
            padding: 4px 6px !important;
            min-width: 40px !important;
          }
          .grid-container {
            gap: 4px !important;
          }
          .main-card {
            padding: 16px !important;
          }
          .clue-display {
            padding: 12px !important;
            font-size: 1.1rem !important;
          }
          .secret-coord {
            font-size: 1.4rem !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .grid-cell {
            padding: 14px !important;
            font-size: 0.875rem !important;
            min-width: 55px !important;
            min-height: 55px !important;
          }
          .grid-header {
            font-size: 0.75rem !important;
            padding: 6px 8px !important;
          }
          .grid-container {
            gap: 6px !important;
          }
        }
        @media (min-width: 1025px) {
          .grid-cell {
            padding: 18px !important;
            font-size: 1rem !important;
            min-width: 65px !important;
            min-height: 65px !important;
          }
          .grid-header {
            font-size: 0.875rem !important;
            padding: 8px 12px !important;
          }
          .grid-container {
            gap: 8px !important;
          }
        }
      `}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px'
      }}>
        <div className="main-card" style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '768px',
          width: '100%'
        }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center'
        }} className="game-title">
          Cross Clue
        </h1>
        
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          borderRadius: '8px',
          background: connected ? '#d4edda' : '#f8d7da',
          color: connected ? '#155724' : '#721c24',
          fontWeight: '600',
          fontSize: '0.95rem',
          textAlign: 'center'
        }}>
          {connected ? '✓ Connected' : '○ Disconnected'}
        </div>

        <div style={{
          color: '#666',
          fontSize: '0.9rem',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Session: <strong>{sessionId}</strong>
        </div>

        {!gameState ? (
          <button
            onClick={handleInitGame}
            disabled={!connected}
            style={{
              width: '100%',
              padding: '16px',
              background: connected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => {
              if (connected) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Start Game
          </button>
        ) : (
          <>
            {/* 4x4 Game Grid */}
            <div style={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              paddingBottom: '16px',
              marginBottom: '30px'
            }}>
              <div className="grid-container" style={{
                display: 'grid',
                gridTemplateColumns: 'max-content repeat(4, 1fr)',
                gap: '8px',
                minWidth: 'fit-content'
              }}>
                {/* Empty top-left corner */}
                <div />
                
                {/* Column headers */}
                {cols.map((col, idx) => (
                  <div key={`col-${col}`} className="grid-header" style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#667eea',
                    fontSize: '0.875rem',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    {gameState.col_words[idx]}
                  </div>
                ))}
                
                {/* Row headers and tiles */}
                {rows.map((row, rowIdx) => (
                  <React.Fragment key={`row-${row}`}>
                    <div className="grid-header" style={{
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#667eea',
                      fontSize: '0.875rem',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      whiteSpace: 'nowrap'
                    }}>
                      {gameState.row_words[rowIdx]}
                    </div>
                    {cols.map((col) => {
                      const coord = `${row}${col}`
                      const tileState = gameState.grid_state[coord] || 'empty'
                      const isSuccess = tileState === 'success'
                      const isFail = tileState === 'fail'
                      const isEmpty = tileState === 'empty'
                      
                      return (
                        <button
                          key={coord}
                          className="grid-cell"
                          onClick={() => isEmpty && handleGuess(coord)}
                          disabled={!isEmpty}
                          style={{
                            padding: '20px',
                            aspectRatio: '1',
                            background: isSuccess 
                              ? '#28a745' 
                              : isFail 
                                ? '#dc3545' 
                                : '#ffffff',
                            color: isSuccess || isFail ? 'white' : '#333',
                            border: isEmpty ? '2px solid #e9ecef' : 'none',
                            borderRadius: '8px',
                            cursor: isEmpty ? 'pointer' : 'not-allowed',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            boxShadow: isEmpty ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                            minWidth: '65px',
                            minHeight: '65px'
                          }}
                          onMouseOver={(e) => {
                            if (isEmpty) {
                              e.target.style.background = '#f0f0f0'
                              e.target.style.transform = 'translateY(-2px)'
                              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)'
                            }
                          }}
                          onMouseOut={(e) => {
                            if (isEmpty) {
                              e.target.style.background = '#ffffff'
                              e.target.style.transform = 'translateY(0)'
                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
                            }
                          }}
                        >
                          {isSuccess ? '✓' : isFail ? '✗' : coord}
                        </button>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Active Clue Display */}
            {gameState.active_clue && (
              <div className="clue-display" style={{
                marginBottom: '30px',
                padding: '20px',
                background: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#856404',
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Current Clue
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  color: '#333',
                  fontWeight: '700'
                }}>
                  "{gameState.active_clue}"
                </div>
              </div>
            )}

            {/* Clue Giver Console */}
            <div style={{
              padding: '24px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              {!secretCard ? (
                <button
                  onClick={handleDrawCard}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Draw Card
                </button>
              ) : (
                <div>
                  <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#e7f3ff',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#667eea',
                      marginBottom: '4px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Your Secret Coordinate
                    </div>
                    <div className="secret-coord" style={{
                      fontSize: '2rem',
                      color: '#333',
                      fontWeight: '700'
                    }}>
                      {secretCard}
                    </div>
                  </div>
                  
                  <div style={{
                    marginBottom: '12px'
                  }}>
                    <input
                      type="text"
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      placeholder="Enter your clue..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitClue()}
                      style={{
                        width: '100%',
                        padding: '14px',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dee2e6'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmitClue}
                    disabled={!clueInput.trim()}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: clueInput.trim() 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: clueInput.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (clueInput.trim()) {
                        e.target.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    Submit Clue
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}

export default CrossClue
