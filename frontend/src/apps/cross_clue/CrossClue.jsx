import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import ModuxLayout from '../../components/layout/ModuxLayout';
import LobbyStage from '../../components/stages/LobbyStage';
import ArenaStage from '../../components/stages/ArenaStage';
import RecapStage from '../../components/stages/RecapStage';
import CrossClueArena from './components/CrossClueArena';
import CrossClueRecap from './components/CrossClueRecap';

function CrossClue() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { username, userId } = useUser();
  
  const { gameState, isConnected, secretCard, sendMessage } = useGameSocket(
    'cross-clue',
    sessionId,
    userId,
    username || `Player_${userId.substring(5, 9)}`
  );

  if (!sessionId) {
    navigate('/portal/cross-clue');
    return null;
  }

  const handleLeave = () => {
    navigate('/');
  };

  if (!isConnected || !gameState) {
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
    );
  }

  const handleToggleReady = () => {
    sendMessage('toggle_ready');
  };

  const handleStartGame = () => {
    sendMessage('start_game');
  };

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState?.players || {}).map(id => {
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

  const isHost = gameState?.host_id === userId;

  const renderStageContent = () => {
    const currentPlayer = gameState.players[userId];
    const isSpectator = currentPlayer?.is_spectator || false;
    const playerStage = currentPlayer?.player_stage;
    
    // If game is finished and player is in lobby stage, show lobby
    if (gameState.status === 'finished' && playerStage === 'lobby') {
      return (
        <LobbyStage
          gameType="cross_clue"
          isHost={isHost}
          players={playerArray}
          gameConfig={{ mode: 'cooperative', grid: '4x4' }}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          currentUserId={userId}
          gameState={gameState}
          sendMessage={(payload) => sendMessage(payload.action, payload)}
        />
      );
    }
    
    switch (gameState.status) {
      case 'waiting':
        return (
          <LobbyStage
            gameType="cross_clue"
            isHost={isHost}
            players={playerArray}
            gameConfig={{ mode: 'cooperative', grid: '4x4' }}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            currentUserId={userId}
            gameState={gameState}
            sendMessage={(payload) => sendMessage(payload.action, payload)}
          />
        );
      case 'playing':
        return (
          <ArenaStage isSpectator={isSpectator} spectatorMessage="The game is in progress. You can observe the clues and guesses!">
            <CrossClueArena
              gameState={gameState}
              userId={userId}
              sendMessage={(payload) => sendMessage(payload.action, payload)}
              secretCard={secretCard}
            />
          </ArenaStage>
        );
      case 'finished':
        return (
          <RecapStage
            title="Game Complete!"
            subtitle="Great teamwork!"
            onReturnToLobby={() => sendMessage('return_to_lobby')}
          >
            <CrossClueRecap
              gameState={gameState}
              userId={userId}
              sendMessage={(payload) => sendMessage(payload.action, payload)}
            />
          </RecapStage>
        );
      default:
        return <div>Loading... Status: {gameState.status}</div>;
    }
  };

  return (
    <ModuxLayout
      appName="Cross Clue"
      sessionId={sessionId}
      players={playerArray}
      gameState={gameState}
      onLeave={handleLeave}
      currentUserId={userId}
    >
      {renderStageContent()}
    </ModuxLayout>
  );
}

export default CrossClue;
