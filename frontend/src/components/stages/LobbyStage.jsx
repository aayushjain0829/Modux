import React, { useState } from 'react'
import './LobbyStage.css'

function LobbyStage({ gameType, isHost, players, gameConfig, onToggleReady, onStartGame, currentUserId, gameState, sendMessage }) {
  const activePlayers = players.filter(p => !p.is_spectator)
  const readyCount = activePlayers.filter(p => p.is_ready).length
  const totalActive = activePlayers.length
  const allReady = totalActive >= 2 && readyCount === totalActive
  
  // Find the current user in the players array
  const currentUser = players.find(p => p.id === currentUserId)
  const isCurrentUserReady = currentUser?.is_ready || false
  
  // Configuration state for CrossClue
  const [localTurnTimer, setLocalTurnTimer] = useState(gameState?.turn_timer || 60)
  const [localGameTimer, setLocalGameTimer] = useState(gameState?.game_timer || 300)
  const [isSaved, setIsSaved] = useState(false)

  // Configuration state for Bingo
  const [localGridSize, setLocalGridSize] = useState(gameState?.config?.grid_size || 5)
  const [localFirstPlayerRule, setLocalFirstPlayerRule] = useState(gameState?.config?.first_player_rule || 'random')

  // Check if this is CrossClue game
  const isCrossClue = gameType === 'cross_clue' || (gameConfig?.mode === 'cooperative' && gameConfig?.grid === '4x4')

  // Check if this is Bingo game
  const isBingo = gameType === 'bingo' || (!isCrossClue && (!gameConfig || Object.keys(gameConfig).length === 0))
  
  // Handle local configuration updates (draft state)
  const handleLocalConfigUpdate = (timerType, value) => {
    const newValue = parseInt(value) || 60

    if (timerType === 'turn') {
      setLocalTurnTimer(newValue)
    } else if (timerType === 'game') {
      setLocalGameTimer(newValue)
    }
  }

  // Handle Bingo configuration updates
  const handleBingoConfigUpdate = (configType, value) => {
    if (configType === 'grid_size') {
      setLocalGridSize(parseInt(value))
    } else if (configType === 'first_player_rule') {
      setLocalFirstPlayerRule(value)
    }
  }

  // Handle save rules function
  const handleSaveRules = () => {
    const configData = {
      action: 'update_config',
      user_id: currentUserId
    }

    if (isCrossClue) {
      configData.config = {
        turn_timer: localTurnTimer,
        game_timer: localGameTimer
      }
    } else if (isBingo) {
      configData.config = {
        grid_size: localGridSize,
        first_player_rule: localFirstPlayerRule
      }
    }

    sendMessage(configData)

    // Show saved feedback
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="lobby-stage">
      {/* Status Area */}
      <div className="lobby-status">
        <h2 className="lobby-title">
          {totalActive < 2 ? "Waiting for 2nd Player..." : "Waiting for Players..."}
        </h2>
        <div className="ready-status">
          <span className="ready-count">{readyCount}/{totalActive}</span>
          <span className="ready-label">Ready</span>
        </div>
      </div>

      {/* Settings Preview */}
      <div className="lobby-settings">
        <div className="settings-header">
          <h3 className="settings-title">Game Rules</h3>
          {isHost && (isCrossClue || isBingo) && (
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
          ) : isBingo ? (
            // Bingo configuration
            <div className="bingo-config">
              {isHost ? (
                // Host can edit Bingo settings
                <div className="timer-grid">
                  <div className="timer-row">
                    <label className="timer-label">
                      Grid Size
                    </label>
                    <select
                      value={localGridSize}
                      onChange={(e) => handleBingoConfigUpdate('grid_size', e.target.value)}
                      className="glass-input"
                    >
                      <option value={5}>5x5</option>
                      <option value={6}>6x6</option>
                      <option value={7}>7x7</option>
                      <option value={8}>8x8</option>
                    </select>
                  </div>
                  <div className="timer-row">
                    <label className="timer-label">
                      First Player
                    </label>
                    <select
                      value={localFirstPlayerRule}
                      onChange={(e) => handleBingoConfigUpdate('first_player_rule', e.target.value)}
                      className="glass-input"
                    >
                      <option value="random">Random</option>
                      <option value="host">Host</option>
                      {players.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                // Non-host players see read-only settings from gameState
                <div className="timer-grid">
                  <div className="timer-row">
                    <label className="timer-label">
                      Grid Size
                    </label>
                    <span className="timer-number">
                      {gameState?.config?.grid_size || 5}x{gameState?.config?.grid_size || 5}
                    </span>
                  </div>
                  <div className="timer-row">
                    <label className="timer-label">
                      First Player
                    </label>
                    <span className="timer-number" style={{ textTransform: 'capitalize' }}>
                      {gameState?.config?.first_player_rule === 'random' ? 'Random' :
                       gameState?.config?.first_player_rule === 'host' ? 'Host' :
                       players.find(p => p.id === gameState?.config?.first_player_rule)?.name || gameState?.config?.first_player_rule}
                    </span>
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
