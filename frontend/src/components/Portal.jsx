import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { GAME_METADATA } from '../constants/gameRegistry';

const Portal = () => {
  const { appName } = useParams();
  const navigate = useNavigate();
  const { username } = useUser();
  
  const [sessionId, setSessionId] = useState('');

  const gameInfo = GAME_METADATA[appName] || {
    title: appName ? appName.replace(/-/g, ' ').toUpperCase() : 'GAME',
    description: 'Join an existing game or create a new one'
  };

  const handleCreateGame = () => {
    // Generate random 6-character session ID
    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Navigate to the game
    navigate(`/${appName}/${newSessionId}`);
  };

  const handleJoinGame = () => {
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    
    // Navigate to the game
    navigate(`/${appName}/${sessionId.trim().toUpperCase()}`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '8px 16px',
          fontSize: '0.9rem',
          color: 'white',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          zIndex: 10
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ← Back
      </button>

      {/* Center Card */}
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '450px',
        width: '100%'
      }}>
        {/* Personalized Welcome */}
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '8px',
          color: '#333',
          textTransform: 'capitalize'
        }}>
          Welcome, {username || 'Player'}!
        </h1>
        
        <h2 style={{
          fontSize: '1.4rem',
          marginBottom: '12px',
          color: '#667eea',
          fontWeight: '600'
        }}>
          {gameInfo.title}
        </h2>
        
        <p style={{
          fontSize: '1rem',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          {gameInfo.description}
        </p>

        {/* Session ID Input */}
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#333',
            fontWeight: '600'
          }}>
            Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="Enter room ID to join"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              textTransform: 'uppercase'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleJoinGame}
            disabled={!sessionId.trim()}
            style={{
              flex: 1,
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: sessionId.trim() ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: sessionId.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (sessionId.trim()) {
                e.target.style.background = '#5568d3';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.background = sessionId.trim() ? '#667eea' : '#ccc';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Join Game
          </button>
          
          <button
            onClick={handleCreateGame}
            style={{
              flex: 1,
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portal;
