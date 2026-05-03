import React from 'react'
import './ArenaStage.css'

function ArenaStage({ isSpectator }) {
  return (
    <div className="arena-stage">
      {/* Spectator Mode Banner */}
      {isSpectator && (
        <div className="spectator-banner">
          <div className="spectator-content">
            <span className="spectator-icon">👁️</span>
            <span className="spectator-text">Spectator Mode</span>
            <span className="spectator-desc">Watching the game in progress</span>
          </div>
        </div>
      )}

      {/* Main Arena Content */}
      <div className="arena-content">
        <div className="arena-placeholder">
          <div className="arena-icon">🏟️</div>
          <h1 className="arena-title">ARENA ACTIVE</h1>
          <p className="arena-subtitle">Game in progress</p>
          
          <div className="arena-status">
            <div className="status-item">
              <div className="status-dot active"></div>
              <span>Game Active</span>
            </div>
            <div className="status-item">
              <div className="status-dot"></div>
              <span>Players Connected</span>
            </div>
            <div className="status-item">
              <div className="status-dot"></div>
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>

        {/* Game Controls Placeholder */}
        <div className="game-controls">
          <div className="control-section">
            <h3 className="control-title">Game Controls</h3>
            <div className="control-buttons">
              <button className="control-btn primary">Action 1</button>
              <button className="control-btn secondary">Action 2</button>
              <button className="control-btn tertiary">Action 3</button>
            </div>
          </div>
        </div>

        {/* Game Board Placeholder */}
        <div className="game-board">
          <div className="board-placeholder">
            <div className="board-grid">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="board-cell"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArenaStage
