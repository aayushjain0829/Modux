import React from 'react';

const BingoActive = ({ gameState, userId, sendMessage }) => {
  // Calculate if it's the current player's turn
  const isMyTurn = gameState.turn_order[gameState.current_turn_index] === userId;
  
  // Get current player data
  const currentPlayer = gameState.players[userId];
  const linesCompleted = currentPlayer?.lines_completed || 0;
  
  // Get the username of the player whose turn it is
  const currentTurnPlayerId = gameState.turn_order[gameState.current_turn_index];
  const currentTurnPlayer = gameState.players[currentTurnPlayerId];
  const currentTurnUsername = currentTurnPlayer?.username || 'Unknown';
  
  // B-I-N-G-O letters
  const bingoLetters = ['B', 'I', 'N', 'G', 'O'];
  
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
      
      {/* B-I-N-G-O Tracker */}
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
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px'
      }}>
        {currentPlayer?.board?.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const isCalled = gameState.called_numbers.includes(number);
            const canClick = isMyTurn && !isCalled;
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => canClick && handleNumberClick(number)}
                disabled={!canClick}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: isCalled ? '#28a745' : canClick ? '#667eea' : '#dee2e6',
                  background: isCalled 
                    ? '#d4edda' 
                    : canClick 
                      ? '#ffffff' 
                      : '#f8f9fa',
                  color: isCalled ? '#155724' : canClick ? '#333' : '#6c757d',
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  textDecoration: isCalled ? 'line-through' : 'none',
                  opacity: isCalled ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (canClick) {
                    e.target.style.background = '#e9ecef';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (canClick) {
                    e.target.style.background = '#ffffff';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {number}
              </button>
            );
          })
        )}
      </div>
      
      {/* Game Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Lines completed: <strong>{linesCompleted}/5</strong>
        </p>
      </div>
    </div>
  );
};

export default BingoActive;
