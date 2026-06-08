import React, { useState, useEffect } from 'react';
import SpectatorView from '../../../components/common/SpectatorView';
import GameGrid from '../../../components/common/GameGrid';
import { useSpectator } from '../../../hooks/useSpectator';
import './CrossClueSetup.css';

const CrossClueSetup = ({ gameState, userId, sendMessage }) => {
  const { isSpectator, currentPlayer } = useSpectator(gameState, userId);
  
  if (isSpectator) {
    return <SpectatorView />;
  }

  const { row_words = [], col_words = [], word_history = [] } = gameState;
  const hasSubmitted = currentPlayer?.has_submitted;
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = () => {
    sendMessage({ action: 'submit_setup' });
  };

  const isHost = gameState.host_id === userId;

  const handleReroll = (wordType, index) => {
    sendMessage({ action: 'reroll_word', word_type: wordType, index });
  };

  const handleUndo = () => {
    sendMessage({ action: 'undo_reroll' });
  };

  return (
    <div className="cc-setup-container">
      <div className="cc-setup-instructions">
        <h3>Pre-Game Strategy</h3>
        <p>Review the grid below with your team. Discuss your initial thoughts before the timer starts!</p>
      </div>

      <div style={{ padding: '16px 0', width: '100%', maxWidth: '100%', margin: '0 auto', overflowX: 'auto', overflowY: 'visible' }}>
        <GameGrid
          cols={4}
          rows={4}
          colHeaders={col_words.map((word, idx) => (
            <div 
              key={`col-${idx}`} 
              className={`game-grid-header-pill ${isHost ? 'clickable' : ''}`}
              style={{ padding: '4px 0px', cursor: isHost ? 'pointer' : 'default' }}
              onClick={() => isHost && handleReroll('col', idx)}
              title={isHost ? "Click to shuffle" : ""}
            >
              <div className="cc-header-index">
                {idx + 1}
              </div>
              <div className="cc-header-word vertical">
                {word}
              </div>
            </div>
          ))}
          rowHeaders={row_words.map((word, idx) => (
            <div 
              key={`row-${idx}`} 
              className={`game-grid-header-pill ${isHost ? 'clickable' : ''}`}
              style={{ padding: '4px 0px', cursor: isHost ? 'pointer' : 'default' }}
              onClick={() => isHost && handleReroll('row', idx)}
              title={isHost ? "Click to shuffle" : ""}
            >
              <div className="cc-header-index">
                {String.fromCharCode(65 + idx)}
              </div>
              <div className="cc-header-word">
                {word}
              </div>
            </div>
          ))}
          renderCell={(row, col) => (
            <div
              key={`${row}-${col}`}
              className="modux-grid-cell not-clickable"
              style={{ cursor: 'default' }}
            >
            </div>
          )}
        />
      </div>

      <div className="cc-setup-action">
        {hasSubmitted ? (
          <div className="cc-setup-waiting">
            <span className="cc-spinner"></span>
            Waiting for other players...
          </div>
        ) : (
          <div className="cc-setup-btn-group">
            <button className="cc-setup-btn" onClick={handleSubmit}>
              I'm Ready to Play!
            </button>
            {isHost && word_history.length > 0 && (
              <button className="cc-undo-btn" onClick={handleUndo}>
                Undo Last Reroll
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossClueSetup;
