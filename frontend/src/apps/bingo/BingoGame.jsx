import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGameSocket } from '../../hooks/useGameSocket';
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
  
  const { gameState, isConnected, sendMessage } = useGameSocket(
    'bingo', 
    sessionId, 
    userId, 
    username || `Player_${userId.substring(5, 9)}`
  );

  if (!sessionId) {
    navigate('/portal/bingo');
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

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState.players || {}).map(id => {
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

  const handleToggleReady = () => {
    sendMessage('toggle_ready');
  };

  const handleStartGame = () => {
    sendMessage('start_game');
  };

  const renderStageContent = () => {
    const currentPlayer = gameState.players[userId];
    const playerStage = currentPlayer?.player_stage;
    const isSpectator = currentPlayer?.is_spectator || false;
    
    // If game is finished and player is in lobby stage, show lobby
    if (gameState.status === 'finished' && playerStage === 'lobby') {
      return (
        <LobbyStage
          gameType="bingo"
          isHost={isHost}
          players={playerArray}
          gameConfig={{}} // Empty config for Bingo
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
            gameType="bingo"
            isHost={isHost}
            players={playerArray}
            gameConfig={{}} // Empty config for Bingo
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            currentUserId={userId}
            gameState={gameState}
            sendMessage={(payload) => sendMessage(payload.action, payload)}
          />
        );
      case 'setup':
        return (
          <SetupStage title="Preparing Bingo..." subtitle="Arrange your board">
            <BingoSetup
              gameState={gameState}
              userId={userId}
              sendMessage={(payload) => sendMessage(payload.action, payload)}
            />
          </SetupStage>
        );
      case 'playing':
        return (
          <ArenaStage isSpectator={isSpectator} spectatorMessage="The game has already started...">
            <BingoActive
              gameState={gameState}
              userId={userId}
              sendMessage={(payload) => sendMessage(payload.action, payload)}
            />
          </ArenaStage>
        );
      case 'finished':
        return (
          <RecapStage 
            title="BINGO!" 
            subtitle={gameState.winner === userId ? "You won!" : "Game Over"}
            onReturnToLobby={() => sendMessage('return_to_lobby')}
            onPlayAgain={isHost ? () => sendMessage('play_again') : null}
          >
            <BingoRecap
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
