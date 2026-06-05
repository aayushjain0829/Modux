import React from 'react';
import SpectatorView from '../../../components/common/SpectatorView';
import { useSpectator } from '../../../hooks/useSpectator';
import './CrossClueSetup.css';

const CrossClueSetup = ({ gameState, userId, sendMessage }) => {
  const { isSpectator, currentPlayer } = useSpectator(gameState, userId);
  
  if (isSpectator) {
    return <SpectatorView />;
  }

  const { row_words = [], col_words = [] } = gameState;
  const hasSubmitted = currentPlayer?.has_submitted;

  const handleSubmit = () => {
    sendMessage({ action: 'submit_setup' });
  };

  const isHost = gameState.host_id === userId;

  const handleReroll = (wordType, index) => {
    sendMessage({ action: 'reroll_word', word_type: wordType, index });
  };

  return (
    <div className="cc-setup-container">
      <div className="cc-setup-instructions">
        <h3>Pre-Game Strategy</h3>
        <p>Review the grid below with your team. Discuss your initial thoughts before the timer starts!</p>
      </div>

      <div className="cc-setup-grid-preview">
        <div className="cc-preview-header">
          <div className="cc-preview-cell empty"></div>
          {col_words.map((word, idx) => (
            <div key={`col-${idx}`} className="cc-preview-cell label">
              <span className="cc-preview-index">{idx + 1}</span>
              <span className="cc-preview-word">
                {word}
                {isHost && (
                  <button className="cc-reroll-btn" onClick={() => handleReroll('col', idx)} title="Reroll word">🔄</button>
                )}
              </span>
            </div>
          ))}
        </div>
        
        {row_words.map((rowWord, rowIdx) => (
          <div key={`row-${rowIdx}`} className="cc-preview-row">
            <div className="cc-preview-cell label">
              <span className="cc-preview-index">{['A', 'B', 'C', 'D'][rowIdx]}</span>
              <span className="cc-preview-word">
                {rowWord}
                {isHost && (
                  <button className="cc-reroll-btn" onClick={() => handleReroll('row', rowIdx)} title="Reroll word">🔄</button>
                )}
              </span>
            </div>
            {col_words.map((_, colIdx) => (
              <div key={`cell-${rowIdx}-${colIdx}`} className="cc-preview-cell inner">
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="cc-setup-action">
        {hasSubmitted ? (
          <div className="cc-setup-waiting">
            <span className="cc-spinner"></span>
            Waiting for other players...
          </div>
        ) : (
          <button className="cc-setup-btn" onClick={handleSubmit}>
            I'm Ready to Play!
          </button>
        )}
      </div>
    </div>
  );
};

export default CrossClueSetup;
