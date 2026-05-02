import React, { useState } from 'react';

const BingoSetup = ({ gameState, userId, sendMessage }) => {
  const [grid, setGrid] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Manual cell click handler
  const handleCellClick = (rowIndex, colIndex) => {
    const newNumber = prompt(`Enter number for cell (${rowIndex}, ${colIndex}):`);
    if (newNumber === null) return;
    
    const num = parseInt(newNumber, 10);
    if (isNaN(num) || num < 1 || num > 25) {
      alert('Please enter a number between 1 and 25');
      return;
    }

    // Check for duplicates
    const flatGrid = grid.flat();
    if (flatGrid.includes(num)) {
      alert('This number is already in the grid');
      return;
    }

    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = num;
    setGrid(newGrid);
  };

  // Submit board
  const submitBoard = () => {
    // Validate grid is complete
    if (grid.length !== 5 || grid.some(row => row.length !== 5)) {
      alert('Please complete the 5x5 grid');
      return;
    }

    const flatGrid = grid.flat();
    if (flatGrid.length !== 25 || new Set(flatGrid).size !== 25) {
      alert('Grid must contain exactly the numbers 1-25 with no duplicates');
      return;
    }

    sendMessage({
      action: 'submit_board',
      board: grid
    });
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {grid.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            background: '#f8f9fa',
            borderRadius: '8px',
            color: '#666'
          }}>
            Click "Auto-Shuffle Board" to generate your grid, or click cells to enter numbers manually
          </div>
        ) : (
          grid.map((row, rowIndex) =>
            row.map((num, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e9ecef';
                  e.target.style.borderColor = '#667eea';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#dee2e6';
                }}
              >
                {num || ''}
              </div>
            ))
          )
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={submitBoard}
          disabled={grid.length === 0}
          style={{
            padding: '12px 24px',
            background: grid.length === 0 ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: grid.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            if (grid.length !== 0) e.target.style.background = '#218838';
          }}
          onMouseOut={(e) => {
            if (grid.length !== 0) e.target.style.background = '#28a745';
          }}
        >
          Submit Board
        </button>
      </div>
    </div>
  );
};

export default BingoSetup;
