import React from 'react'

function LobbyStage({ 
  isHost = false, 
  isReady = false, 
  onToggleReady, 
  onStartGame, 
  configModule = null 
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px'
    }}>
      {/* Top Section: Configuration Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        {configModule ? (
          configModule
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
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p style={{
              fontSize: '1rem',
              fontWeight: '500',
              margin: '0 0 8px 0'
            }}>
              {isHost ? 'Standard Rules Apply' : 'Waiting for host to start...'}
            </p>
            <p style={{
              fontSize: '0.85rem',
              opacity: 0.7,
              margin: 0
            }}>
              Game configuration will appear here
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section: Actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        padding: '0 20px 20px'
      }}>
        {/* Ready Button */}
        <button
          onClick={onToggleReady}
          style={{
            width: '100%',
            maxWidth: '280px',
            padding: '18px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: isReady ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
            background: isReady 
              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
              : 'transparent',
            color: isReady ? 'white' : 'rgba(255, 255, 255, 0.9)',
            boxShadow: isReady ? '0 4px 15px rgba(40, 167, 69, 0.4)' : 'none'
          }}
          onMouseOver={(e) => {
            if (!isReady) {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            }
          }}
          onMouseOut={(e) => {
            if (!isReady) {
              e.target.style.background = 'transparent'
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          {isReady ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Ready!
            </span>
          ) : (
            'I am Ready!'
          )}
        </button>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <button
            onClick={onStartGame}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '18px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Game!
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default LobbyStage
