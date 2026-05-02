import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        position: 'relative'
      }}>
        {/* Settings Gear Icon */}
        <button
          onClick={() => {
            setTempUsername(username)
            setShowSettings(true)
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            color: '#666'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.05)'
            e.target.style.color = '#333'
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none'
            e.target.style.color = '#666'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <h1 style={{
          fontSize: '2rem',
          marginBottom: '10px',
          color: '#333'
        }}>
          Modux
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Modular Web Platform
        </p>
        {username && (
          <p style={{
            fontSize: '0.9rem',
            color: '#888',
            marginBottom: '20px'
          }}>
            Welcome, {username}!
          </p>
        )}
        <button
          onClick={() => navigate('/lobby/cross-clue')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            width: '100%',
            marginBottom: '15px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Play Cross Clue
        </button>
        <button
          onClick={() => navigate('/lobby/bingo')}
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Play BINGO
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #eee'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.3rem',
                color: '#333'
              }}>
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal Body - Two Column Layout */}
            <div style={{
              display: 'flex',
              flex: 1,
              minHeight: 0
            }}>
              {/* Left Tabs */}
              <div style={{
                width: '120px',
                background: '#f8f9fa',
                borderRight: '1px solid #eee',
                padding: '16px 0'
              }}>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: 'none',
                    borderLeft: '3px solid #667eea',
                    color: '#333',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  Profile
                </button>
              </div>

              {/* Right Content Area */}
              <div style={{
                flex: 1,
                padding: '24px',
                overflow: 'auto'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ddd'
                    }}
                  />
                </div>

                {/* Save/Close Button */}
                <button
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.opacity = '0.9'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.opacity = '1'
                  }}
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
