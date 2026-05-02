import React, { useState, useEffect, useRef } from 'react';
import BingoSetup from './components/BingoSetup';

const BingoGame = ({ sessionId }) => {
  const [gameState, setGameState] = useState({
    session_id: sessionId,
    status: 'setup',
    turn_order: [],
    current_turn_index: 0,
    called_numbers: [],
    winner: null,
    players: {}
  });
  const [userId, setUserId] = useState('');
  const wsRef = useRef(null);

  // Helper function to get or generate unique user ID
  const getUserId = () => {
    let id = sessionStorage.getItem('modux_user_id');
    if (!id) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      id = result;
      sessionStorage.setItem('modux_user_id', id);
    }
    return id;
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageWithUserId = { ...message, user_id: userId };
      wsRef.current.send(JSON.stringify(messageWithUserId));
    }
  };

  useEffect(() => {
    // Initialize user ID on component mount
    const id = getUserId();
    setUserId(id);

    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/bingo/${sessionId}`;

    // Connect to WebSocket
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      // Join game on connection
      sendMessage({
        action: 'join_game',
        username: `Player_${id.substring(0, 4)}`
      });
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'state_update') {
        setGameState(data.data);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '30px',
          fontSize: '2rem',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          BINGO
        </h1>

        {gameState.status === 'setup' && (
          <BingoSetup
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
          />
        )}

        {gameState.status === 'playing' && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
              Game In Progress
            </h2>
            <p style={{ color: '#666' }}>
              Active game UI coming in Phase 3
            </p>
          </div>
        )}

        {gameState.status === 'finished' && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
              Game Over!
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#333' }}>
              Winner: {gameState.winner}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoGame;
