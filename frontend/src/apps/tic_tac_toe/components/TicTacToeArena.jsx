import React from 'react';
import GameGrid from '../../../components/common/GameGrid';
import { useSpectator } from '../../../hooks/useSpectator';

const TicTacToeArena = ({ gameState, userId, sendMessage }) => {
  const { isSpectator } = useSpectator(gameState, userId);
  const gridSize = 3;
  const board = gameState.board || [];
  
  const hostId = gameState.turn_order[0];
  const opponentId = gameState.turn_order[1];
  
  const hostPlayer = gameState.players[hostId];
  const opponentPlayer = gameState.players[opponentId];
  
  const currentTurnPlayerId = gameState.turn_order[gameState.current_turn_index];
  const isMyTurn = !isSpectator && currentTurnPlayerId === userId;

  const handleCellClick = (row, col) => {
    if (isSpectator || !isMyTurn || board[row][col] !== null) {
      return;
    }
    sendMessage({ action: 'place_mark', row, col });
  };

  const renderCell = (row, col) => {
    const cellValue = board[row] && board[row][col];
    let content = null;
    let cellClass = 'modux-grid-cell';
    
    if (cellValue === hostId) {
      content = <div className="tic-tac-toe-cell-x">X</div>;
    } else if (cellValue === opponentId) {
      content = <div className="tic-tac-toe-cell-o">O</div>;
    }
    
    if (cellValue === null && isMyTurn) {
      cellClass += ' clickable';
    } else if (cellValue !== null) {
      cellClass += ' not-clickable';
    }
    
    // Highlight last move
    if (gameState.last_move && gameState.last_move.row === row && gameState.last_move.col === col) {
      cellClass += ' tic-tac-toe-last-move';
    }

    return (
      <div 
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="tic-tac-toe-arena">
      <div className="tic-tac-toe-status-banner" style={{
        padding: '12px 20px',
        marginBottom: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        background: isSpectator ? 'rgba(255,255,255,0.1)' : (isMyTurn ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 165, 2, 0.15)'),
        color: isSpectator ? '#ffffff' : (isMyTurn ? '#2ed573' : '#ffa502'),
        border: `1px solid ${isSpectator ? 'rgba(255,255,255,0.2)' : (isMyTurn ? 'rgba(46, 213, 115, 0.4)' : 'rgba(255, 165, 2, 0.4)')}`,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        {isSpectator ? (
           "Spectating"
        ) : isMyTurn ? (
           "Your Turn!"
        ) : (
           "Waiting for opponent..."
        )}
      </div>

      <div className="tic-tac-toe-score-board">
        <div className={`tic-tac-toe-player x ${currentTurnPlayerId === hostId ? 'active' : ''}`}>
          <div className="name">{hostPlayer?.username || 'Player 1'}</div>
          <div className="symbol">X</div>
        </div>
        <div className="vs-badge" style={{ fontSize: '1.5rem', fontWeight: 900, opacity: 0.3 }}>VS</div>
        <div className={`tic-tac-toe-player o ${currentTurnPlayerId === opponentId ? 'active' : ''}`}>
          <div className="name">{opponentPlayer?.username || 'Player 2'}</div>
          <div className="symbol">O</div>
        </div>
      </div>
      
      <GameGrid
        rows={gridSize}
        cols={gridSize}
        renderCell={renderCell}
        maxWidth="500px"
      />
    </div>
  );
};

export default TicTacToeArena;
