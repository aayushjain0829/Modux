import React from 'react';
import GameGrid from '../../../components/common/GameGrid';

const TicTacToeRecap = ({ gameState, userId, sendMessage }) => {
  const isHost = gameState?.host_id === userId;
  const gridSize = 3;
  const board = gameState.board || [];
  
  const hostId = gameState.turn_order[0];
  const opponentId = gameState.turn_order[1];
  
  const winnerId = gameState.winner;
  const isTie = winnerId === 'tie';
  
  let winnerText = "It's a Tie!";
  if (!isTie && winnerId) {
    const winnerName = gameState.players[winnerId]?.username || 'Player';
    winnerText = `${winnerName} Wins!`;
  }
  
  const renderCell = (row, col) => {
    const cellValue = board[row] && board[row][col];
    let content = null;
    
    if (cellValue === hostId) {
      content = <div className="tic-tac-toe-cell-x">X</div>;
    } else if (cellValue === opponentId) {
      content = <div className="tic-tac-toe-cell-o">O</div>;
    }

    return (
      <div className="modux-grid-cell not-clickable">
        {content}
      </div>
    );
  };

  return (
    <div className="tic-tac-toe-recap" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px', color: isTie ? '#ffa502' : '#2ed573' }}>
        {winnerText}
      </h2>
      
      <div style={{ display: 'inline-block', marginBottom: '32px' }}>
        <GameGrid
          rows={gridSize}
          cols={gridSize}
          renderCell={renderCell}
          maxWidth="300px"
        />
      </div>
    </div>
  );
};

export default TicTacToeRecap;
