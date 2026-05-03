import React from 'react'
import './LobbyStage.css'

function LobbyStage({ isHost, players, gameConfig, onToggleReady, onStartGame }) {
  const readyCount = players.filter(p => p.isReady).length
  const totalPlayers = players.length
  const allReady = totalPlayers > 0 && readyCount === totalPlayers

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
        <h3 className="settings-title">Game Rules</h3>
        <div className="settings-content">
          {gameConfig && Object.keys(gameConfig).length > 0 ? (
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
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="lobby-actions">
        <button
          onClick={onToggleReady}
          className={`ready-toggle ${players.find(p => p.id === 'current')?.isReady ? 'ready' : ''}`}
        >
          {players.find(p => p.id === 'current')?.isReady ? 'Cancel Ready' : 'I am Ready'}
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
