import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ModuxLayout from '../../components/layout/ModuxLayout';
import LobbyStage from '../../components/stages/LobbyStage';
import SetupStage from '../../components/stages/SetupStage';
import ArenaStage from '../../components/stages/ArenaStage';
import RecapStage from '../../components/stages/RecapStage';
import BingoSetup from './components/BingoSetup';
import BingoActive from './components/BingoActive';

const BingoGame = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { username, userId } = useUser();
  
  const [gameState, setGameState] = useState({
    session_id: sessionId,
    status: 'lobby',
    turn_order: [],
    current_turn_index: 0,
    called_numbers: [],
    winner: null,
    players: {}
  });
  const [currentStage, setCurrentStage] = useState('lobby'); // lobby, setup, arena, recap
  const wsRef = useRef(null);

  // Security check: redirect to portal if username is empty
  useEffect(() => {
    if (!username || username.trim() === '') {
      navigate('/portal/bingo');
    }
  }, [username, navigate]);

  // Handle stage transitions based on game state
  useEffect(() => {
    if (gameState) {
      if (gameState.status === 'lobby') {
        setCurrentStage('lobby')
      } else if (gameState.status === 'setup') {
        setCurrentStage('setup')
      } else if (gameState.status === 'active') {
        setCurrentStage('arena')
      } else if (gameState.status === 'completed') {
        setCurrentStage('recap')
      }
    }
  }, [gameState])

  // Dev toggle functionality
  const handleDevToggle = () => {
    const stages = ['lobby', 'setup', 'arena', 'recap']
    const currentIndex = stages.indexOf(currentStage)
    const nextIndex = (currentIndex + 1) % stages.length
    setCurrentStage(stages[nextIndex])
  }

  // Handle leave game
  const handleLeave = () => {
    navigate('/');
  };

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState.players).map(id => ({
    id,
    name: gameState.players[id]?.username || id,
    isReady: gameState.players[id]?.is_ready || false
  }));

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
      // Join game on connection using global username
      sendMessage({
        action: 'join_game',
        username: username || `Player_${userId.substring(5, 9)}`
      });
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'state_update') {
        // Force new object reference to trigger React re-render
        setGameState({ ...data.data });
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

  if (!sessionId) {
    navigate('/portal/bingo');
    return null;
  }

  // Handle stage transitions
  const handleToggleReady = () => {
    sendMessage({
      type: 'toggle_ready',
      user_id: userId
    })
  }

  const handleStartGame = () => {
    sendMessage({
      type: 'start_game',
      user_id: userId
    })
  }

  // Render based on current stage
  const renderStageContent = () => {
    switch (currentStage) {
      case 'lobby':
        return (
          <LobbyStage
            isHost={gameState?.host_id === userId}
            players={playerArray}
            gameConfig={{}} // Empty config for Bingo
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
          />
        )
      case 'setup':
        return (
          <BingoSetup
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
          />
        )
      case 'arena':
        return (
          <BingoActive
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
          />
        )
      case 'recap':
        return (
          <RecapStage />
        )
      default:
        return <div>Loading...</div>
    }
  }

  return (
    <>
      <ModuxLayout
        appName="Bingo"
        sessionId={sessionId}
        players={playerArray}
        onLeave={handleLeave}
      >
        {renderStageContent()}
      </ModuxLayout>
      
      {/* Dev Toggle Button */}
      <button
        onClick={handleDevToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          zIndex: 1000,
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        }}
      >
        Dev Toggle: {currentStage.toUpperCase()}
      </button>
    </>
  );
};

export default BingoGame;
