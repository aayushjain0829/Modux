import React from 'react'

function PrepareStage({ 
  isReady = false, 
  onToggleReady, 
  setupModule = null 
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px'
    }}>
      {/* Setup Module Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto'
      }}>
        {setupModule ? (
          setupModule
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
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p style={{
              fontSize: '1rem',
              fontWeight: '500',
              margin: 0
            }}>
              No setup required
            </p>
          </div>
        )}
      </div>

      {/* Action Button Area */}
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={onToggleReady}
          disabled={isReady}
          style={{
            width: '100%',
            maxWidth: '280px',
            padding: '18px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '12px',
            cursor: isReady ? 'default' : 'pointer',
            transition: 'all 0.2s',
            border: 'none',
            background: isReady 
              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: isReady 
              ? '0 4px 15px rgba(40, 167, 69, 0.4)' 
              : '0 4px 15px rgba(102, 126, 234, 0.4)',
            opacity: isReady ? 0.9 : 1
          }}
          onMouseOver={(e) => {
            if (!isReady) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
            }
          }}
          onMouseOut={(e) => {
            if (!isReady) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {isReady ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Waiting for others...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Submit & Ready!
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default PrepareStage
