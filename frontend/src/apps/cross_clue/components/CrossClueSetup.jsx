import React, { useState, useEffect } from 'react';
import SpectatorView from '../../../components/common/SpectatorView';
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

      {isMobile ? (
        <div className="cc-setup-mobile-lists">
          <div className="cc-mobile-word-group">
            <h4 className="cc-mobile-group-title">Rows (A-D)</h4>
            <div className="cc-mobile-word-list">
              {row_words.map((word, idx) => (
                <div key={`row-${idx}`} className="cc-mobile-word-item">
                  <span className="cc-mobile-index">{['A', 'B', 'C', 'D'][idx]}</span>
                  {isHost ? (
                    <span className="cc-preview-word clickable" onClick={() => handleReroll('row', idx)} title="Click to shuffle">{word}</span>
                  ) : (
                    <span className="cc-preview-word">{word}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="cc-mobile-word-group">
            <h4 className="cc-mobile-group-title">Columns (1-4)</h4>
            <div className="cc-mobile-word-list">
              {col_words.map((word, idx) => (
                <div key={`col-${idx}`} className="cc-mobile-word-item">
                  <span className="cc-mobile-index">{idx + 1}</span>
                  {isHost ? (
                    <span className="cc-preview-word clickable" onClick={() => handleReroll('col', idx)} title="Click to shuffle">{word}</span>
                  ) : (
                    <span className="cc-preview-word">{word}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="cc-setup-grid-preview">
          <div className="cc-preview-header">
            <div className="cc-preview-cell empty"></div>
            {col_words.map((word, idx) => (
              <div key={`col-${idx}`} className="cc-preview-cell label">
                <span className="cc-preview-index">{idx + 1}</span>
                {isHost ? (
                  <span 
                    className="cc-preview-word clickable" 
                    onClick={() => handleReroll('col', idx)}
                    title="Click to shuffle"
                  >
                    {word}
                  </span>
                ) : (
                  <span className="cc-preview-word">{word}</span>
                )}
              </div>
            ))}
          </div>
          
          {row_words.map((rowWord, rowIdx) => (
            <div key={`row-${rowIdx}`} className="cc-preview-row">
              <div className="cc-preview-cell label">
                <span className="cc-preview-index">{['A', 'B', 'C', 'D'][rowIdx]}</span>
                {isHost ? (
                  <span 
                    className="cc-preview-word clickable" 
                    onClick={() => handleReroll('row', rowIdx)}
                    title="Click to shuffle"
                  >
                    {rowWord}
                  </span>
                ) : (
                  <span className="cc-preview-word">{rowWord}</span>
                )}
              </div>
              {col_words.map((_, colIdx) => (
                <div key={`cell-${rowIdx}-${colIdx}`} className="cc-preview-cell inner">
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

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
