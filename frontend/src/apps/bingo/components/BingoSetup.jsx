import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../BingoGame.css';
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
      toast.error('Please fill all cells in the grid');
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
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
        Setup Your Bingo Board
      </h2>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={autoShuffle}
          className="bingo-btn bingo-btn-primary"
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
        gap: '4px',
        marginBottom: '20px'
      }}>
        {grid.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((num, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                onClick={() => !isSubmitted && handleCellClick(rowIndex, colIndex)}
                className={`bingo-setup-cell ${isSubmitted ? 'submitted' : (num !== null ? 'filled' : 'empty')}`}
                style={{
                  fontSize: gridSize > 6 ? '0.8rem' : '1.1rem',
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
            className={`bingo-btn ${!isBoardComplete() ? 'bingo-btn-disabled' : 'bingo-btn-success'}`}
          >
            Submit Board
          </button>
        )}
      </div>
    </div>
  );
};

export default BingoSetup;
