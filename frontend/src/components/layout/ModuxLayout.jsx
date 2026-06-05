import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './ModuxLayout.css'

function ModuxLayout({ appName, sessionId, players = [], gameState, onLeave, currentUserId, children }) {
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const handleCopySession = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modux-layout">
      {/* Top Header */}
      <header className="modux-header">
        {/* Left: Mobile Menu + Leave Button */}
        <div className="modux-header-left">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="modux-menu-toggle"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {sidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
            </svg>
          </button>
          
          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="modux-leave-button"
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
            <span>Leave</span>
          </button>
        </div>

        {/* Center: App Name */}
        <h1 className="modux-app-name">
          {appName}
        </h1>

        {/* Right: Session ID with Copy */}
        <div className="modux-session-info">
          <span className="modux-room-label">
            Room:
          </span>
          <span className="modux-session-id">
            {sessionId}
          </span>
          <button
            onClick={handleCopySession}
            className={`modux-copy-button ${copied ? 'copied' : ''}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => setQrOpen(true)}
            className="modux-qr-button"
          >
            QR
          </button>
        </div>
      </header>

      {/* Two-Column Body */}
      <div className="modux-body">
        {/* Left Sidebar: Player List */}
        <aside className={`modux-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Mobile Close Button */}
          <div className="modux-sidebar-header">
            <h3 className="modux-sidebar-title">
              Players ({players.length})
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="modux-sidebar-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div className="modux-players-list">
            {players.length === 0 ? (
              <p className="modux-no-players">
                No players yet
              </p>
            ) : (
              players.map((player, index) => {
                const statusClass = 
                  // Check individual player stage first
                  player.player_stage === 'lobby'
                    ? (player.is_ready ? 'ready' : 'not-ready')
                    : gameState?.status === 'waiting'
                      ? (player.is_ready ? 'ready' : 'not-ready')
                      : player.is_spectator 
                        ? 'spectator'
                        : gameState?.status === 'setup' 
                          ? (player.has_submitted ? 'submitted' : 'not-submitted')
                          : gameState?.status === 'playing' 
                            ? 'ready'  // All players are ready in Arena
                            : gameState?.status === 'finished'
                              ? 'ready'  // All players are ready in Recap
                              : (player.is_ready ? 'ready' : 'not-ready');
                
                console.log('ModuxLayout: Status', {name: player.name, is_ready: player.is_ready, statusClass, gameStatus: gameState?.status});
                
                return (
                <div
                  key={player.id || index}
                  className="modux-player-item"
                >
                  {/* Status Indicator */}
                  <span
                    className={`modux-player-status ${statusClass}`}
                  >
                    {
                      // Check individual player stage first
                      player.player_stage === 'lobby'
                        ? null
                        : gameState?.status === 'waiting'
                          ? null
                          : player.is_spectator 
                            ? '👁️'
                            : null  // Other stages use dots, no text needed
                    }
                  </span>
                  
                  {/* Player Name */}
                  <span className="modux-player-name">
                    {player.name || 'Unknown'}{player.id === currentUserId && ' (you)'}
                  </span>
                </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="modux-main-content">
          {children}
        </main>
      </div>

      {/* QR Code Modal */}
      {qrOpen && (
        <div className="modux-modal-overlay" onClick={() => setQrOpen(false)}>
          <div className="modux-modal" onClick={e => e.stopPropagation()}>
            <div className="modux-modal-header">
              <h3>Scan to Join</h3>
              <button onClick={() => setQrOpen(false)} className="modux-modal-close-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modux-qr-container">
              <QRCodeSVG 
                value={`${window.location.origin}/portal/${appName.toLowerCase().replace(' ', '-')}/${sessionId}`} 
                size={200} 
              />
            </div>
            <p className="modux-modal-code">{sessionId}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuxLayout
