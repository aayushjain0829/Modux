import React from 'react'
import './RecapStage.css'

function RecapStage({ title = "Game Complete!", subtitle = "Great job everyone!", onReturnToLobby, onPlayAgain, children }) {
  return (
    <div className="recap-stage">
      <div className="recap-content">
        <div className="game-over-header">
          <h1 className="game-over-title">{title}</h1>
          <p className="game-over-subtitle">{subtitle}</p>
        </div>

        {children}

        <div className="action-buttons">
          {onReturnToLobby && (
            <button className="action-btn secondary" onClick={onReturnToLobby}>
              <span className="btn-icon">🏠</span>
              <span className="btn-text">Return to Lobby</span>
            </button>
          )}
          {onPlayAgain && (
            <button className="action-btn primary" onClick={onPlayAgain}>
              <span className="btn-icon">🎮</span>
              <span className="btn-text">Play Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecapStage
