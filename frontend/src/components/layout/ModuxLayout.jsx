import React, { useState } from 'react'

function ModuxLayout({ appName, sessionId, players = [], onLeave, children }) {
  const [copied, setCopied] = useState(false)

  const handleCopySession = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Left: Leave/Back Button */}
        <button
          onClick={onLeave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Leave
        </button>

        {/* Center: App Name */}
        <h1 style={{
          color: 'white',
          fontSize: '1.4rem',
          fontWeight: '700',
          margin: 0,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          {appName}
        </h1>

        {/* Right: Session ID with Copy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '8px'
        }}>
          <span style={{
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            Room:
          </span>
          <span style={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {sessionId}
          </span>
          <button
            onClick={handleCopySession}
            style={{
              padding: '4px 10px',
              background: copied ? '#28a745' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '60px'
            }}
            onMouseOver={(e) => {
              if (!copied) {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              }
            }}
            onMouseOut={(e) => {
              if (!copied) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </header>

      {/* Two-Column Body */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '20px',
        gap: '20px'
      }}>
        {/* Left Sidebar: Player List */}
        <aside style={{
          width: '220px',
          minWidth: '220px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '@media (max-width: 768px)': {
            width: '100%'
          }
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            margin: '0 0 16px 0',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            Players ({players.length})
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {players.length === 0 ? (
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.85rem',
                textAlign: 'center',
                margin: '20px 0'
              }}>
                No players yet
              </p>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  {/* Status Indicator */}
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: player.isReady ? '#28a745' : '#dc3545',
                      flexShrink: 0,
                      boxShadow: player.isReady 
                        ? '0 0 8px rgba(40, 167, 69, 0.5)' 
                        : '0 0 8px rgba(220, 53, 69, 0.5)'
                    }}
                  />
                  
                  {/* Player Name */}
                  <span style={{
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {player.name || 'Unknown'}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default ModuxLayout
