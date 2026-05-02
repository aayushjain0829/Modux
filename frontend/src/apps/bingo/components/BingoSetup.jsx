import React, { useState } from 'react';

const BingoSetup = ({ gameState, userId, sendMessage }) => {
  // Initialize 5x5 grid with null values
  const [grid, setGrid] = useState(() => 
    Array(5).fill(null).map(() => Array(5).fill(null))
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Helper function to find the lowest available number (1-25) not in use
  const getLowestAvailableNumber = () => {
    const usedNumbers = new Set(grid.flat().filter(n => n !== null));
    for (let i = 1; i <= 25; i++) {
      if (!usedNumbers.has(i)) {
        return i;
      }
    }
    return null; // All numbers used
  };

  // Check if board is complete (no null values)
  const isBoardComplete = () => {
    return grid.every(row => row.every(cell => cell !== null));
  };

  // Auto-shuffle: populate grid with randomized 1-25
  const autoShuffle = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    // Convert to 5x5 array
    const grid5x5 = [];
    for (let i = 0; i < 5; i++) {
      grid5x5.push(numbers.slice(i * 5, (i + 1) * 5));
    }
    setGrid(grid5x5);
  };

  // Sequential click handler: empty cell gets lowest available, filled cell becomes null
  const handleCellClick = (rowIndex, colIndex) => {
    const newGrid = grid.map(row => [...row]);
    
    if (newGrid[rowIndex][colIndex] !== null) {
      // Clicking a filled cell reclaims the number (sets to null)
      newGrid[rowIndex][colIndex] = null;
    } else {
      // Clicking an empty cell assigns the lowest available number
      const lowestAvailable = getLowestAvailableNumber();
      if (lowestAvailable !== null) {
        newGrid[rowIndex][colIndex] = lowestAvailable;
      }
    }
    
    setGrid(newGrid);
  };

  // Submit board
  const submitBoard = () => {
    if (!isBoardComplete()) {
      alert('Please fill all cells in the grid');
      return;
    }

    const payload = {
      action: 'submit_board',
      board: grid
    };
    sendMessage(payload);
    setIsSubmitted(true);
  };

  // Check if current player is ready
  const currentPlayer = gameState.players[userId];
  const isPlayerReady = currentPlayer?.is_ready || false;

  // Waiting room state
  if (isPlayerReady || isSubmitted) {
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
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
          {gameState.status === 'playing' ? 'Game Starting!' : 'Waiting Room'}
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
          {gameState.status === 'playing' 
            ? 'All players are ready. The game is about to begin!'
            : 'Board Locked! Waiting for other players to submit their boards...'}
        </p>
        <div style={{ 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Players Ready:</h3>
          {Object.values(gameState.players).map((player, idx) => (
            <div key={idx} style={{
              padding: '10px',
              margin: '5px 0',
              background: player.is_ready ? '#d4edda' : '#f8d7da',
              borderRadius: '4px',
              color: player.is_ready ? '#155724' : '#721c24'
            }}>
              {player.username} {player.is_ready ? '✓' : '⏳'}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Setup grid state
  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
        Setup Your Bingo Board
      </h2>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={autoShuffle}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#5568d3'}
          onMouseOut={(e) => e.target.style.background = '#667eea'}
        >
          Auto-Shuffle Board
        </button>
      </div>

      {/* Next number indicator */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px',
        padding: '10px',
        background: '#e9ecef',
        borderRadius: '8px'
      }}>
        <span style={{ color: '#666' }}>Next number: </span>
        <span style={{ 
          fontWeight: '700', 
          color: '#667eea',
          fontSize: '1.2rem'
        }}>
          {getLowestAvailableNumber() || 'None - Board full!'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {grid.map((row, rowIndex) =>
          row.map((num, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: num !== null ? '#d4edda' : '#f8f9fa',
                border: '2px solid',
                borderColor: num !== null ? '#28a745' : '#dee2e6',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: num !== null ? '#155724' : '#adb5bd',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (num !== null) {
                  e.target.style.background = '#f8d7da';
                  e.target.style.borderColor = '#dc3545';
                } else {
                  e.target.style.background = '#e9ecef';
                  e.target.style.borderColor = '#667eea';
                }
              }}
              onMouseOut={(e) => {
                if (num !== null) {
                  e.target.style.background = '#d4edda';
                  e.target.style.borderColor = '#28a745';
                } else {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#dee2e6';
                }
              }}
            >
              {num !== null ? num : '+'}
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={submitBoard}
          disabled={!isBoardComplete()}
          style={{
            padding: '12px 24px',
            background: !isBoardComplete() ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: !isBoardComplete() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            if (isBoardComplete()) e.target.style.background = '#218838';
          }}
          onMouseOut={(e) => {
            if (isBoardComplete()) e.target.style.background = '#28a745';
          }}
        >
          Submit Board
        </button>
      </div>
    </div>
  );
};

export default BingoSetup;
