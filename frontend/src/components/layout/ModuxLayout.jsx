import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useUser } from '../../context/UserContext'
import './ModuxLayout.css'

function ModuxLayout({ appName, sessionId, players = [], gameState, onLeave, currentUserId, sendMessage, children }) {
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [networkIp, setNetworkIp] = useState(window.location.hostname)
  
  const { updateUsername } = useUser()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState("")

  // Rest of ModuxLayout

  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const fetchIp = async () => {
        try {
          const res = await fetch('http://localhost:8000/network-ip');
          const data = await res.json();
          if (data.ip) {
            setNetworkIp(data.ip);
          }
        } catch (e) {
          console.error('Failed to fetch network IP', e);
        }
      };
      fetchIp();
    }
  }, []);

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
                    {player.id === gameState?.host_id && <span className="modux-host-indicator" title="Host">👑 </span>}
                    {player.id === currentUserId ? (
                      isEditingName ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const newName = editNameValue.trim();
                                setIsEditingName(false);
                                if (newName !== '') {
                                  if (sendMessage) {
                                    sendMessage('update_username', { username: newName });
                                  }
                                  // Defer context update to avoid triggering WS reconnect mid-render
                                  setTimeout(() => updateUsername(newName), 0);
                                }
                              } else if (e.key === 'Escape') {
                                setIsEditingName(false);
                              }
                            }}
                            autoFocus
                            style={{ 
                              background: 'rgba(255,255,255,0.1)', 
                              border: '1px solid rgba(255,255,255,0.3)', 
                              color: 'white',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              width: '100px',
                              fontSize: '0.9em'
                            }}
                          />
                          <button 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const newName = editNameValue.trim();
                              setIsEditingName(false);
                              if (newName !== '') {
                                if (sendMessage) {
                                  sendMessage('update_username', { username: newName });
                                }
                                setTimeout(() => updateUsername(newName), 0);
                              }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', opacity: 0.9, fontSize: '0.9em' }}
                            title="Save"
                          >
                            ✅
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{player.name || 'Unknown'}</span>
                          <button 
                            onClick={() => {
                              setEditNameValue(player.name || '');
                              setIsEditingName(true);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', opacity: 0.7, fontSize: '0.9em' }}
                            title="Edit Name"
                          >
                            ✏️
                          </button>
                        </div>
                      )
                    ) : (
                      <>{player.name || 'Unknown'}</>
                    )}
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
              {(() => {
                const baseUrl = import.meta.env.BASE_URL || '/';
                const formattedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
                const portStr = window.location.port ? `:${window.location.port}` : '';
                const qrUrl = `${window.location.protocol}//${networkIp}${portStr}${formattedBase}${appName.toLowerCase().replace(' ', '-')}/${sessionId}`;
                
                return <QRCodeSVG value={qrUrl} size={200} />;
              })()}
            </div>
            <p className="modux-modal-code">{sessionId}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuxLayout
