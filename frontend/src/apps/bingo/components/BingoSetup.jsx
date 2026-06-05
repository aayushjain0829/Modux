import React, { useState, useEffect } from 'react';
import SpectatorView from '../../../components/common/SpectatorView';
import { useSpectator } from '../../../hooks/useSpectator';

const BingoSetup = ({ gameState, userId, sendMessage }) => {
  // Read grid_size from config, default to 5
  const gridSize = gameState?.config?.grid_size || 5;
  const maxNumber = gridSize * gridSize;

  // Initialize dynamic grid with null values
  const [grid, setGrid] = useState(() =>
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset submitted state when game moves to setup stage
  useEffect(() => {
    if (gameState.status === 'setup') {
      setIsSubmitted(false);
      setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    }
  }, [gameState.status, gridSize]);

  // Helper function to find the lowest available number (1 to maxNumber) not in use
  const getLowestAvailableNumber = () => {
    const usedNumbers = new Set(grid.flat().filter(n => n !== null));
    for (let i = 1; i <= maxNumber; i++) {
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

  // Auto-shuffle: populate grid with randomized 1 to maxNumber
  const autoShuffle = () => {
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    // Convert to gridSize x gridSize array
    const dynamicGrid = [];
    for (let i = 0; i < gridSize; i++) {
      dynamicGrid.push(numbers.slice(i * gridSize, (i + 1) * gridSize));
    }
    setGrid(dynamicGrid);
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

  // Check spectator status
  const { isSpectator } = useSpectator(gameState, userId);

  // Spectator view
  if (isSpectator) {
    return <SpectatorView />;
  }

  // In Setup stage, always show the board interface
  // No waiting room needed - sidebar shows submission status
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
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gap: '8px',
        marginBottom: '20px'
      }}>
        {grid.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((num, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                onClick={() => !isSubmitted && handleCellClick(rowIndex, colIndex)}
                style={{
                  aspectRatio: '1/1',
                  minHeight: gridSize > 6 ? '35px' : '50px',
                  background: isSubmitted ? '#e9ecef' : (num !== null ? '#d4edda' : '#f8f9fa'),
                  border: isSubmitted ? '2px solid #ced4da' : (num !== null ? '2px solid #28a745' : '2px solid #dee2e6'),
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: gridSize > 6 ? '0.8rem' : '1.1rem',
                  fontWeight: '600',
                  color: isSubmitted ? '#6c757d' : (num !== null ? '#155724' : '#6c757d'),
                  cursor: isSubmitted ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isSubmitted ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isSubmitted) {
                    if (num !== null) {
                      e.target.style.background = '#f8d7da';
                      e.target.style.borderColor = '#dc3545';
                    } else {
                      e.target.style.background = '#e9ecef';
                      e.target.style.borderColor = '#667eea';
                    }
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitted) {
                    if (num !== null) {
                      e.target.style.background = '#d4edda';
                      e.target.style.borderColor = '#28a745';
                    } else {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#dee2e6';
                    }
                  }
                }}
              >
                {num !== null ? num : '+'}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        {isSubmitted ? (
          <div style={{
            padding: '12px 24px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            display: 'inline-block'
          }}>
            ✓ Board Submitted - Waiting for others...
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default BingoSetup;
