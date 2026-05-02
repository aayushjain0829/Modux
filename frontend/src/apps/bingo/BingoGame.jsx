import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BingoSetup from './components/BingoSetup';
import BingoActive from './components/BingoActive';

const BingoGame = () => {
  const { sessionId } = useParams();
  const [gameState, setGameState] = useState({
    session_id: sessionId,
    status: 'setup',
    turn_order: [],
    current_turn_index: 0,
    called_numbers: [],
    winner: null,
    players: {}
  });
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 9));
  const wsRef = useRef(null);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageWithUserId = { ...message, user_id: userId };
      wsRef.current.send(JSON.stringify(messageWithUserId));
    }
  };

  useEffect(() => {
    // Safety check for undefined sessionId
    if (!sessionId) {
      return;
    }

    // Determine WebSocket URL - use backend port 8000
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/ws/bingo/${sessionId}`;

    // Connect to WebSocket
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // Join game on connection
      sendMessage({
        action: 'join_game',
        username: `Player_${userId.substring(5, 9)}`
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
        {!sessionId ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
              Error: No Session ID
            </h2>
            <p style={{ color: '#666' }}>
              Please navigate to a valid Bingo session URL (e.g., /bingo/ABC123)
            </p>
          </div>
        ) : (
          <>
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
          <BingoActive
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
          />
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
          </>
        )}
      </div>
    </div>
  );
};

export default BingoGame;
