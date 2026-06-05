import React from 'react'
import './SetupStage.css'

function SetupStage({ children, title = "Preparing Game...", subtitle = "Setting up your game experience" }) {
  return (
    <div className="setup-stage">
      <div className="setup-content">
        <div className="preparing-section">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h2 className="preparing-text">{title}</h2>
          <p className="preparing-subtext">{subtitle}</p>
        </div>

        <div className="loadout-section">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SetupStage
