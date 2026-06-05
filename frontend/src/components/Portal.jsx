import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { GAME_METADATA } from '../constants/gameRegistry';
import './Portal.css';

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
    <div className="portal-container">
      {/* Back Button - Top Left */}
      <button
        className="back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>

      {/* Center Card */}
      <div className="portal-card">
        {/* Personalized Welcome */}
        <h1 className="portal-welcome">
          Welcome, {username || 'Player'}!
        </h1>
        
        <h2 className="portal-title">
          {gameInfo.title}
        </h2>
        
        <p className="portal-desc">
          {gameInfo.description}
        </p>

        {/* Session ID Input */}
        <div className="input-group">
          <label>
            Session ID
          </label>
          <input
            type="text"
            className="session-input"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="ENTER ROOM ID TO JOIN"
          />
        </div>

        {/* Action Buttons */}
        <div className="portal-actions">
          <button
            className="action-btn join-btn"
            onClick={handleJoinGame}
            disabled={!sessionId.trim()}
          >
            Join Game
          </button>
          
          <button
            className="action-btn create-btn"
            onClick={handleCreateGame}
          >
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portal;
