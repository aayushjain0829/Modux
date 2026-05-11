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
  
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState({
    session_id: sessionId,
    status: 'waiting',
    host_id: '',
    turn_order: [],
    current_turn_index: 0,
    called_numbers: [],
    winner: null,
    players: {},
    config: { grid_size: 5, first_player_rule: 'random' },
    last_called_number: null
  });
  const wsRef = useRef(null);

  // Username will be handled with fallback in WebSocket join message

  // Handle leave game
  const handleLeave = () => {
    navigate('/');
  };

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState.players).map(id => {
    const player = gameState.players[id];
    return {
      id,
      name: player?.username || id,
      is_ready: player?.is_ready || false,
      has_submitted: player?.has_submitted || false,
      is_spectator: player?.is_spectator || false,
      player_stage: player?.player_stage || 'recap'
    };
  });

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

    // Determine WebSocket URL - adapt for both local development and production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    
    // For GitHub Pages production, use Render backend URL
    // For local development, use port 8000
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const wsUrl = isLocalhost 
      ? `${protocol}//${host}:8000/ws/bingo/${sessionId}`
      : `wss://modux.onrender.com/ws/bingo/${sessionId}`;

    // Connect to WebSocket
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setConnected(true);
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
      setConnected(false);
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

  const isHost = gameState?.host_id === userId

  if (!connected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Connecting to game...
      </div>
    )
  }

  // Handle stage transitions
  const handleToggleReady = () => {
    sendMessage({
      action: 'toggle_ready',
      user_id: userId
    })
  }

  const handleStartGame = () => {
    sendMessage({
      action: 'start_game',
      user_id: userId
    })
  }

  // Render based on backend game state status and individual player stage
  const renderStageContent = () => {
    // Check if player has individual stage override
    const currentPlayer = gameState.players[userId];
    const playerStage = currentPlayer?.player_stage;
    
    // If game is finished and player is in lobby stage, show lobby
    if (gameState.status === 'finished' && playerStage === 'lobby') {
      return (
        <LobbyStage
          isHost={isHost}
          players={playerArray}
          gameConfig={{}} // Empty config for Bingo
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          currentUserId={userId}
          gameState={gameState}
          sendMessage={sendMessage}
        />
      )
    }

    switch (gameState.status) {
      case 'waiting':
        return (
          <LobbyStage
            isHost={isHost}
            players={playerArray}
            gameConfig={{}} // Empty config for Bingo
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            currentUserId={userId}
            gameState={gameState}
            sendMessage={sendMessage}
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
        return <div>Loading... Status: {gameState.status}</div>
    }
  }

  return (
    <ModuxLayout
      appName="Bingo"
      sessionId={sessionId}
      players={playerArray}
      gameState={gameState}
      onLeave={handleLeave}
      currentUserId={userId}
    >
      {renderStageContent()}
    </ModuxLayout>
  );
};

export default BingoGame;
