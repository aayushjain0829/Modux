import React from 'react';

const SpectatorView = ({ message = "The game has already started. Wait for the next round to join as a player." }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
        👁️ Spectator Mode
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
        You are watching the game as a spectator.
      </p>
      <p style={{ fontSize: '1rem', color: '#999' }}>
        {message}
      </p>
    </div>
  );
};

export default SpectatorView;
