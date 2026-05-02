import React from 'react'

function ResultStage({ 
  isHost = false, 
  resultsModule = null, 
  onNextGame, 
  onReturnToLobby 
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px'
    }}>
      {/* Results Module Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto'
      }}>
        {resultsModule ? (
          resultsModule
        ) : (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginBottom: '16px', opacity: 0.5 }}
            >
              <path d="M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
              <path d="M12 11v.01"/>
              <path d="M12 8v.01"/>
              <path d="M12 14v.01"/>
            </svg>
            <p style={{
              fontSize: '1rem',
              fontWeight: '500',
              margin: 0
            }}>
              Game Complete
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Area */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center'
      }}>
        {isHost ? (
          // Host sees both active buttons
          <div style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
            maxWidth: '400px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onNextGame}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '18px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.5)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Next Game
              </span>
            </button>
            
            <button
              onClick={onReturnToLobby}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '18px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 14L4 9l5-5"/>
                  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v.5"/>
                </svg>
                Return to Lobby
              </span>
            </button>
          </div>
        ) : (
          // Non-host sees disabled buttons with waiting message
          <>
            <div style={{
              display: 'flex',
              gap: '16px',
              width: '100%',
              maxWidth: '400px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: 0.5
            }}>
              <button
                disabled
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '18px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '12px',
                  cursor: 'not-allowed',
                  border: 'none',
                  background: '#6c757d',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                Next Game
              </button>
              
              <button
                disabled
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '18px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '12px',
                  cursor: 'not-allowed',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.4)'
                }}
              >
                Return to Lobby
              </button>
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              margin: '8px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Waiting for host to choose next action...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultStage
