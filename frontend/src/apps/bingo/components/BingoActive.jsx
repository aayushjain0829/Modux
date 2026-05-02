import React from 'react';

const BingoActive = ({ gameState, userId, sendMessage }) => {
  const currentPlayer = gameState.players[userId];
  const isMyTurn = gameState.turn_order[gameState.current_turn_index] === userId;
  
  // Get current caller's username
  const currentCallerId = gameState.turn_order[gameState.current_turn_index];
  const currentCaller = gameState.players[currentCallerId];
  const currentCallerName = currentCaller?.username || 'Unknown';

  // B-I-N-G-O letters
  const bingoLetters = ['B', 'I', 'N', 'G', 'O'];
  const linesCompleted = currentPlayer?.lines_completed || 0;

  // Handle number click
  const handleNumberClick = (number) => {
    if (!isMyTurn) return;
    if (gameState.called_numbers.includes(number)) return;
    
    sendMessage({
      action: 'call_number',
      number: number
    });
  };

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Turn Indicator */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        background: isMyTurn ? '#d4edda' : '#f8d7da',
        border: `2px solid ${isMyTurn ? '#28a745' : '#dc3545'}`
      }}>
        <h2 style={{
          margin: 0,
          color: isMyTurn ? '#155724' : '#721c24',
          fontSize: '1.5rem'
        }}>
          {isMyTurn ? '🎯 Your Turn: Select a number!' : `⏳ Waiting for ${currentCallerName} to call...`}
        </h2>
      </div>

      {/* B-I-N-G-O Tracker */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '30px'
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
              fontSize: '1.8rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              background: index < linesCompleted ? '#28a745' : '#f8f9fa',
              color: index < linesCompleted ? 'white' : '#333',
              border: index < linesCompleted ? '3px solid #1e7e34' : '2px solid #dee2e6',
              transition: 'all 0.3s'
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Called Numbers Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
          CALLED NUMBERS
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {gameState.called_numbers.length === 0 ? (
            <span style={{ color: '#999' }}>None yet</span>
          ) : (
            gameState.called_numbers.map((num) => (
              <span
                key={num}
                style={{
                  padding: '6px 12px',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
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
      {currentPlayer?.board && currentPlayer.board.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px'
        }}>
          {currentPlayer.board.map((row, rowIndex) =>
            row.map((num, colIndex) => {
              const isCalled = gameState.called_numbers.includes(num);
              const isClickable = isMyTurn && !isCalled;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => isClickable && handleNumberClick(num)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCalled ? '#28a745' : '#f8f9fa',
                    color: isCalled ? 'white' : '#333',
                    border: isCalled ? '3px solid #1e7e34' : '2px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    opacity: isCalled ? 0.8 : 1,
                    textDecoration: isCalled ? 'line-through' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (isClickable) {
                      e.target.style.background = '#e9ecef';
                      e.target.style.borderColor = '#667eea';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isClickable) {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {num}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          No board data available
        </div>
      )}

      {/* Win Condition */}
      {gameState.status === 'finished' && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: gameState.winner === userId ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center',
          border: `2px solid ${gameState.winner === userId ? '#28a745' : '#dc3545'}`
        }}>
          <h3 style={{
            margin: 0,
            color: gameState.winner === userId ? '#155724' : '#721c24',
            fontSize: '1.5rem'
          }}>
            {gameState.winner === userId ? '🎉 YOU WIN!' : `😢 ${currentCallerName} wins!`}
          </h3>
        </div>
      )}
    </div>
  );
};

export default BingoActive;
