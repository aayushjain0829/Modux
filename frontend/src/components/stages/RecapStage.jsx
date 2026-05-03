import React from 'react'
import './RecapStage.css'

function RecapStage() {
  return (
    <div className="recap-stage">
      <div className="recap-content">
        {/* Game Over Header */}
        <div className="game-over-header">
          <h1 className="game-over-title">Game Complete!</h1>
          <p className="game-over-subtitle">Great job everyone!</p>
        </div>

        {/* Leaderboard Section */}
        <div className="leaderboard-section">
          <h2 className="leaderboard-title">🏆 Leaderboard</h2>
          <div className="leaderboard-placeholder">
            <div className="leaderboard-item">
              <div className="rank gold">1</div>
              <div className="player-info">
                <span className="player-name">Player One</span>
                <span className="player-score">1,250 pts</span>
              </div>
              <div className="rank-icon">🥇</div>
            </div>
            <div className="leaderboard-item">
              <div className="rank silver">2</div>
              <div className="player-info">
                <span className="player-name">Player Two</span>
                <span className="player-score">980 pts</span>
              </div>
              <div className="rank-icon">🥈</div>
            </div>
            <div className="leaderboard-item">
              <div className="rank bronze">3</div>
              <div className="player-info">
                <span className="player-name">Player Three</span>
                <span className="player-score">750 pts</span>
              </div>
              <div className="rank-icon">🥉</div>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="stats-section">
          <h3 className="stats-title">Game Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">12:34</div>
              <div className="stat-label">Duration</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24</div>
              <div className="stat-label">Total Moves</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">89%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn secondary">
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Return to Lobby</span>
          </button>
          <button className="action-btn primary">
            <span className="btn-icon">🎮</span>
            <span className="btn-text">New Game</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecapStage
