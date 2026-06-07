import React from 'react';
import '../BingoGame.css';
import SpectatorView from '../../../components/common/SpectatorView';
import { useSpectator } from '../../../hooks/useSpectator';

const BingoArena = ({ gameState, userId, sendMessage }) => {
  // Read grid_size from config, default to 5
  const gridSize = gameState?.config?.grid_size || 5;
  const maxNumber = gridSize * gridSize;

  // Calculate if it's the current player's turn
  const isMyTurn = gameState.turn_order[gameState.current_turn_index] === userId;

  // Get current player data and spectator status
  const { isSpectator, currentPlayer } = useSpectator(gameState, userId);
  const linesCompleted = currentPlayer?.lines_completed || 0;

  // Get the username of the player whose turn it is
  const currentTurnPlayerId = gameState.turn_order[gameState.current_turn_index];
  const currentTurnPlayer = gameState.players[currentTurnPlayerId];
  const currentTurnUsername = currentTurnPlayer?.username || 'Unknown';

  // Generate BINGO letters: B-I-N-G-O for 5x5, B-I-N-G-O-O for 6x6, etc.
  const baseLetters = ['B', 'I', 'N', 'G', 'O'];
  const bingoLetters = [];
  for (let i = 0; i < gridSize; i++) {
    if (i < baseLetters.length) {
      bingoLetters.push(baseLetters[i]);
    } else {
      // Add extra 'O's for larger grids
      bingoLetters.push('O');
    }
  }
  
  // Handle number click
  const handleNumberClick = (number) => {
    if (!isMyTurn) return;
    if (gameState.called_numbers.includes(number)) return;
    
    sendMessage({
      action: 'call_number',
      number: number
    });
  };
  
  // Spectator view - show message throughout Arena stage
  if (isSpectator) {
    return <SpectatorView />;
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Turn Indicator Banner */}
      <div style={{
        padding: '16px',
        marginBottom: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '1.2rem',
        background: isMyTurn ? '#d4edda' : '#fff3cd',
        color: isMyTurn ? '#155724' : '#856404',
        border: `2px solid ${isMyTurn ? '#28a745' : '#ffc107'}`
      }}>
        {isMyTurn ? '🎯 Your Turn: Select a number!' : `⏳ Waiting for ${currentTurnUsername} to call...`}
      </div>
      
      {/* B-I-N-G-O Tracker - hide for spectators */}
      {!isSpectator && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {bingoLetters.map((letter, index) => (
          <div
            key={letter}
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              borderRadius: '8px',
              background: index < linesCompleted ? '#28a745' : '#e9ecef',
              color: index < linesCompleted ? 'white' : '#6c757d',
              transition: 'all 0.3s ease',
              boxShadow: index < linesCompleted ? '0 4px 8px rgba(40, 167, 69, 0.3)' : 'none'
            }}
          >
            {letter}
          </div>
        ))}
        </div>
      )}
      
      {/* Called Numbers Display */}
      <div style={{
        marginBottom: '20px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '8px', color: '#333', fontSize: '0.9rem' }}>
          Called Numbers:
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {gameState.called_numbers.length === 0 ? (
            <span style={{ color: '#6c757d', fontStyle: 'italic' }}>No numbers called yet</span>
          ) : (
            gameState.called_numbers.map((num) => (
              <span
                key={num}
                style={{
                  padding: '4px 10px',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                {num}
              </span>
            ))
          )}
        </div>
      </div>
      
      {/* Interactive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gap: '4px'
      }}>
        {currentPlayer?.board?.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const isCalled = gameState.called_numbers.includes(number);
            const isLastCalled = number === gameState.last_called_number;
            const canClick = isMyTurn && !isCalled;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => canClick && handleNumberClick(number)}
                className={`bingo-active-cell ${isLastCalled ? 'last-called' : isCalled ? 'called' : canClick ? 'clickable' : 'not-clickable'}`}
                style={{
                  fontSize: gridSize > 6 ? '0.8rem' : '1.1rem',
                }}
              >
                {number}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BingoArena;
