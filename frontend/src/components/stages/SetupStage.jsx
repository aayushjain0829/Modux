import React from 'react'
import './SetupStage.css'

function SetupStage() {
  return (
    <div className="setup-stage">
      <div className="setup-content">
        <div className="preparing-section">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h2 className="preparing-text">Preparing Game...</h2>
          <p className="preparing-subtext">Setting up your game experience</p>
        </div>

        <div className="rules-section">
          <h3 className="rules-title">Game Rules</h3>
          <div className="rules-list">
            <div className="rule-item">
              <span className="rule-number">1</span>
              <span className="rule-text">Follow the game-specific instructions provided</span>
            </div>
            <div className="rule-item">
              <span className="rule-number">2</span>
              <span className="rule-text">Wait for all players to complete setup</span>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <span className="rule-text">Game will begin automatically when ready</span>
            </div>
            <div className="rule-item">
              <span className="rule-number">4</span>
              <span className="rule-text">Good luck and have fun!</span>
            </div>
          </div>
        </div>

        <div className="loadout-section">
          <h3 className="loadout-title">Custom Loadout</h3>
          <div className="loadout-placeholder">
            <div className="loadout-item">
              <div className="loadout-icon">🎮</div>
              <span className="loadout-text">Game-specific configuration</span>
            </div>
            <div className="loadout-item">
              <div className="loadout-icon">⚙️</div>
              <span className="loadout-text">Personal settings and preferences</span>
            </div>
            <div className="loadout-item">
              <div className="loadout-icon">🎯</div>
              <span className="loadout-text">Game mode selection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupStage
