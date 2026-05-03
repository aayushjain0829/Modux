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
import BingoRecap from './components/BingoRecap';

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
  const wsRef = useRef(null);

  // Security check: redirect to portal if username is empty
  useEffect(() => {
    if (!username || username.trim() === '') {
      navigate('/portal/bingo');
    }
  }, [username, navigate]);

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

  // Render based on backend game state status
  const renderStageContent = () => {
    switch (gameState.status) {
      case 'waiting':
        return (
          <LobbyStage
            isHost={gameState?.turn_order?.[0] === userId}
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
      case 'playing':
        return (
          <BingoActive
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
          />
        )
      case 'finished':
        return (
          <BingoRecap
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
            wsRef={wsRef}
          />
        )
      default:
        return <div>Loading...</div>
    }
  }

  return (
    <ModuxLayout
      appName="Bingo"
      sessionId={sessionId}
      players={playerArray}
      onLeave={handleLeave}
    >
      {renderStageContent()}
    </ModuxLayout>
  );
};

export default BingoGame;
