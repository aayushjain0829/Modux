import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { username, updateUsername } = useUser()
  const [showSettings, setShowSettings] = useState(false)
  const [tempUsername, setTempUsername] = useState(username)

  const handleSave = () => {
    updateUsername(tempUsername)
    setShowSettings(false)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* Settings Gear Icon */}
        <button
          className="settings-btn"
          onClick={() => {
            setTempUsername(username)
            setShowSettings(true)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <h1 className="dashboard-title">
          Modux
        </h1>
        <p className="dashboard-subtitle">
          Multiplayer Party Games
        </p>
        {username && (
          <p className="welcome-text">
            Welcome, {username}!
          </p>
        )}
        <button
          className="play-btn cross-clue"
          onClick={() => navigate('/portal/cross-clue')}
        >
          Play Cross Clue
        </button>
        <button
          className="play-btn bingo"
          onClick={() => navigate('/portal/bingo')}
        >
          Play BINGO
        </button>
        <button
          className="play-btn tic-tac-toe"
          onClick={() => navigate('/portal/tic_tac_toe')}
        >
          Play Tic-Tac-Toe
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            {/* Modal Header */}
            <div className="settings-header">
              <h2>Settings</h2>
              <button
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal Body - Two Column Layout */}
            <div className="settings-body">
              {/* Left Tabs */}
              <div className="settings-sidebar">
                <button className="settings-tab">
                  Profile
                </button>
              </div>

              {/* Right Content Area */}
              <div className="settings-content">
                <div className="input-group">
                  <label>Player Name</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Save/Close Button */}
                <button
                  className="save-btn"
                  onClick={handleSave}
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
