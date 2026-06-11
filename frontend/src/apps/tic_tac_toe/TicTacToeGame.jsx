import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import ModuxLayout from '../../components/layout/ModuxLayout';

import LobbyStage from '../../components/stages/LobbyStage';
import ArenaStage from '../../components/stages/ArenaStage';
import RecapStage from '../../components/stages/RecapStage';

import TicTacToeArena from './components/TicTacToeArena';
import TicTacToeRecap from './components/TicTacToeRecap';
import './TicTacToeGame.css';

const TicTacToeGame = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { username, userId } = useUser();

  const { gameState, isConnected, sendMessage } = useGameSocket(
    'tic_tac_toe',
    sessionId,
    userId,
    username || `Player_${userId.substring(5, 9)}`
  );

  const handleLeave = () => {
    sendMessage('leave_game');
    navigate('/');
  };

  if (!gameState) {
    return (
      <ModuxLayout appName="Tic-Tac-Toe" sessionId={sessionId} onLeave={handleLeave} currentUserId={userId}>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading Game State...</div>
      </ModuxLayout>
    );
  }

  const isHost = gameState?.host_id === userId;
  const currentPlayer = gameState.players[userId];
  const playerStage = currentPlayer?.player_stage;
  const isSpectator = currentPlayer?.is_spectator || false;

  const playerArray = Object.keys(gameState.players || {}).map(id => {
    const player = gameState.players[id];
    return {
      id,
      name: player?.username || id,
      ...player
    };
  });

  const wrapSendMessage = (action, payload = {}) => {
    sendMessage(action, payload);
  };

  const handleReturnToLobby = () => wrapSendMessage('return_to_lobby');
  const handlePlayAgain = () => wrapSendMessage('play_again');
  const handleStartGame = () => wrapSendMessage('start_game');
  const handleToggleReady = () => wrapSendMessage('toggle_ready');

  const renderStageContent = () => {
    if (gameState.status === 'finished' && playerStage === 'lobby') {
      return (
        <LobbyStage
          gameType="tic_tac_toe"
          isHost={isHost}
          players={playerArray}
          gameConfig={gameState.config}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          currentUserId={userId}
          gameState={gameState}
          sendMessage={(payload) => wrapSendMessage(payload.action, payload)}
        />
      );
    }

    switch (gameState.status) {
      case 'waiting':
        return (
          <LobbyStage
            gameType="tic_tac_toe"
            isHost={isHost}
            players={playerArray}
            gameConfig={gameState.config}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            currentUserId={userId}
            gameState={gameState}
            sendMessage={(payload) => wrapSendMessage(payload.action, payload)}
          />
        );
      case 'playing':
        return (
          <ArenaStage 
             isSpectator={isSpectator} 
             spectatorMessage="You are spectating the match. Watch closely!"
          >
            <TicTacToeArena gameState={gameState} userId={userId} sendMessage={(payload) => wrapSendMessage(payload.action, payload)} />
          </ArenaStage>
        );
      case 'finished':
        return (
          <RecapStage
            title="Game Over!"
            subtitle="The match has concluded."
            onReturnToLobby={handleReturnToLobby}
            onPlayAgain={isHost ? handlePlayAgain : undefined}
          >
            <TicTacToeRecap gameState={gameState} userId={userId} sendMessage={(payload) => wrapSendMessage(payload.action, payload)} />
          </RecapStage>
        );
      default:
        return <div>Unknown game state: {gameState.status}</div>;
    }
  };

  return (
    <ModuxLayout
      appName="Tic-Tac-Toe"
      sessionId={sessionId}
      players={playerArray}
      gameState={gameState}
      onLeave={handleLeave}
      currentUserId={userId}
      sendMessage={sendMessage}
    >
      {renderStageContent()}
    </ModuxLayout>
  );
};

export default TicTacToeGame;
