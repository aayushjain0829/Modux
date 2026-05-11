import { useParams, useNavigate } from 'react-router-dom'
import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../../context/UserContext'
import ModuxLayout from '../../components/layout/ModuxLayout'
import LobbyStage from '../../components/stages/LobbyStage'
import SetupStage from '../../components/stages/SetupStage'
import ArenaStage from '../../components/stages/ArenaStage'
import RecapStage from '../../components/stages/RecapStage'
import CrossClueSetup from './components/CrossClueSetup'
import CrossClueArena from './components/CrossClueArena'
import CrossClueRecap from './components/CrossClueRecap'
import SpectatorView from '../../components/common/SpectatorView'

function CrossClue() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { username, userId } = useUser()
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [secretCard, setSecretCard] = useState(null)
  const wsRef = useRef(null)

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageWithUserId = { ...message, user_id: userId }
      wsRef.current.send(JSON.stringify(messageWithUserId))
    }
  }

  useEffect(() => {
    // Skip WebSocket connection if no sessionId
    if (!sessionId) {
      navigate('/portal/cross-clue')
      return
    }

    // Determine WebSocket URL - adapt for both local development and Cloudflare
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    
    // For Cloudflare production, don't specify port (uses 80/443)
    // For local development, use port 8000
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const port = isLocalhost ? ':8000' : '';
    const wsUrl = `${protocol}//${host}${port}/ws/cross-clue/${sessionId}`;
    
    const websocket = new WebSocket(wsUrl)
    wsRef.current = websocket

    websocket.onopen = () => {
      setConnected(true)
      // Join game on connection using global username
      sendMessage({
        action: 'join_game',
        username: username || `Player_${userId.substring(5, 9)}`
      });
    };

    websocket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        
        // Handle secret_update messages (private secret card)
        if (parsed.type === 'secret_update') {
          const coordinate = parsed.secret_card
          setSecretCard(coordinate)
        }
        // Handle state_update messages (public game state)
        else if (parsed.type === 'state_update' && parsed.data) {
          // Force new object reference to trigger React re-render
          setGameState({ ...parsed.data });
        }
        // Handle guess_result messages
        else if (parsed.type === 'guess_result' && parsed.data) {
          setGameState(prev => ({
            ...prev,
            grid_state: parsed.data.grid_state
          }))
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    websocket.onclose = () => {
      setConnected(false)
    }

    websocket.onerror = () => {
      setConnected(false)
    }

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close()
      }
    }
  }, [sessionId])

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

  const handleLeave = () => {
    navigate('/')
  }

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState?.players || {}).map(id => {
    const player = gameState.players[id];
    const playerData = {
      id,
      name: player?.username || id,
      is_ready: player?.is_ready || false,
      has_submitted: player?.has_submitted || false,
      is_spectator: player?.is_spectator || false,
      player_stage: player?.player_stage || 'recap'
    };
    console.log('CrossClue: Player data', {id, is_ready: playerData.is_ready, name: playerData.name});
    return playerData;
  });

  const isHost = gameState?.turn_order?.[0] === userId

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

  
  // Render based on backend game state status and individual player stage
  const renderStageContent = () => {
    // Guard clause for null gameState
    if (!gameState) {
      return <div>Loading game state...</div>;
    }
    
    // Check spectator status directly (no hook)
    const currentPlayer = gameState.players[userId];
    const isSpectator = currentPlayer?.is_spectator || false;
    const playerStage = currentPlayer?.player_stage;
    
    // If game is finished and player is in lobby stage, show lobby
    if (gameState.status === 'finished' && playerStage === 'lobby') {
      return (
        <LobbyStage
          isHost={isHost}
          players={playerArray}
          gameConfig={{ mode: 'cooperative', grid: '4x4' }}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          currentUserId={userId}
          gameState={gameState}
          sendMessage={sendMessage}
        />
      )
    }
    
    // Show spectator view for spectators in playing stage
    if (isSpectator && gameState.status === 'playing') {
      return <SpectatorView />;
    }
    
    switch (gameState.status) {
      case 'waiting':
        return (
          <LobbyStage
            isHost={isHost}
            players={playerArray}
            gameConfig={{ mode: 'cooperative', grid: '4x4' }}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            currentUserId={userId}
            gameState={gameState}
            sendMessage={sendMessage}
          />
        )
      case 'playing':
        return (
          <CrossClueArena
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
            secretCard={secretCard}
          />
        )
      case 'finished':
        return (
          <CrossClueRecap
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
      appName="Cross Clue"
      sessionId={sessionId}
      players={playerArray}
      gameState={gameState}
      onLeave={handleLeave}
    >
      {renderStageContent()}
    </ModuxLayout>
  )
}

export default CrossClue
