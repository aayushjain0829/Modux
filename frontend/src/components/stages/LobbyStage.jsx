import React, { useState } from 'react'
import './LobbyStage.css'

function LobbyStage({ isHost, players, gameConfig, onToggleReady, onStartGame, currentUserId, gameState, sendMessage }) {
  const readyCount = players.filter(p => p.is_ready).length
  const totalPlayers = players.length
  const allReady = totalPlayers > 0 && readyCount === totalPlayers
  
  // Find the current user in the players array
  const currentUser = players.find(p => p.id === currentUserId)
  const isCurrentUserReady = currentUser?.is_ready || false
  
  // Configuration state for CrossClue
  const [localTurnTimer, setLocalTurnTimer] = useState(gameState?.turn_timer || 60)
  const [localGameTimer, setLocalGameTimer] = useState(gameState?.game_timer || 300)
  const [isSaved, setIsSaved] = useState(false)
  
  // Check if this is CrossClue game
  const isCrossClue = gameConfig?.mode === 'cooperative' && gameConfig?.grid === '4x4'
  
  // Handle local configuration updates (draft state)
  const handleLocalConfigUpdate = (timerType, value) => {
    const newValue = parseInt(value) || 60
    
    if (timerType === 'turn') {
      setLocalTurnTimer(newValue)
    } else if (timerType === 'game') {
      setLocalGameTimer(newValue)
    }
  }
  
  // Handle save rules function
  const handleSaveRules = () => {
    sendMessage({
      action: 'update_config',
      user_id: currentUserId,
      turn_timer: localTurnTimer,
      game_timer: localGameTimer
    })
    
    // Show saved feedback
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="lobby-stage">
      {/* Status Area */}
      <div className="lobby-status">
        <h2 className="lobby-title">Waiting for Players...</h2>
        <div className="ready-status">
          <span className="ready-count">{readyCount}/{totalPlayers}</span>
          <span className="ready-label">Ready</span>
        </div>
      </div>

      {/* Settings Preview */}
      <div className="lobby-settings">
        <div className="settings-header">
          <h3 className="settings-title">Game Rules</h3>
          {isHost && isCrossClue && (
            <button
              onClick={handleSaveRules}
              className={`save-rules-btn ${isSaved ? 'saved' : ''}`}
            >
              {isSaved ? 'Saved!' : 'Save'}
            </button>
          )}
        </div>
        <div className="settings-content">
          {isCrossClue ? (
            // CrossClue timer configuration
            <div className="crossclue-config">
              {isHost ? (
                // Host can edit timers
                <div className="timer-grid">
                  <div className="timer-row">
                    <label className="timer-label">
                      Turn Timer
                    </label>
                    <div className="timer-input-wrapper">
                      <input
                        type="number"
                        min="30"
                        max="300"
                        value={localTurnTimer}
                        onChange={(e) => handleLocalConfigUpdate('turn', e.target.value)}
                        className="glass-input"
                      />
                      <span className="timer-suffix">sec</span>
                    </div>
                  </div>
                  <div className="timer-row">
                    <label className="timer-label">
                      Game Timer
                    </label>
                    <div className="timer-input-wrapper">
                      <input
                        type="number"
                        min="60"
                        max="1800"
                        value={localGameTimer}
                        onChange={(e) => handleLocalConfigUpdate('game', e.target.value)}
                        className="glass-input"
                      />
                      <span className="timer-suffix">sec</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Non-host players see read-only timers from gameState
                <div className="timer-grid">
                  <div className="timer-row">
                    <label className="timer-label">
                      Turn Timer
                    </label>
                    <div className="timer-value">
                      <span className="timer-number">{gameState?.turn_timer || 60}</span>
                      <span className="timer-suffix">sec</span>
                    </div>
                  </div>
                  <div className="timer-row">
                    <label className="timer-label">
                      Game Timer
                    </label>
                    <div className="timer-value">
                      <span className="timer-number">{Math.floor((gameState?.game_timer || 300) / 60)}m {(gameState?.game_timer || 300) % 60}s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Other games show standard config
            gameConfig && Object.keys(gameConfig).length > 0 ? (
              Object.entries(gameConfig).map(([key, value]) => (
                <div key={key} className="setting-item">
                  <span className="setting-key">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                  </span>
                  <span className="setting-value">{value}</span>
                </div>
              ))
            ) : (
              <p className="no-settings">Standard game rules apply</p>
            )
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="lobby-actions">
        <button
          onClick={onToggleReady}
          className={`ready-toggle ${isCurrentUserReady ? 'btn-danger' : 'btn-success-soft'}`}
        >
          {isCurrentUserReady ? 'Not Ready' : 'I am Ready'}
        </button>

        {isHost && (
          <button
            onClick={onStartGame}
            className={`start-game ${allReady ? 'enabled' : 'disabled'}`}
            disabled={!allReady}
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  )
}

export default LobbyStage
