import { useParams, useNavigate } from 'react-router-dom'
import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../../context/UserContext'
import ModuxLayout from '../../components/layout/ModuxLayout'
import LobbyStage from '../../components/stages/LobbyStage'
import CrossClueSetup from './components/CrossClueSetup'
import CrossClueArena from './components/CrossClueArena'

function CrossClue() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { username, userId } = useUser()
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [secretCard, setSecretCard] = useState(null)
  const [currentStage, setCurrentStage] = useState('lobby') // lobby, setup, arena
  const wsRef = useRef(null)

  // Security check: redirect to portal if username is empty
  useEffect(() => {
    if (!username || username.trim() === '') {
      navigate('/portal/cross-clue')
    }
  }, [username, navigate])

  // Handle stage transitions based on game state
  useEffect(() => {
    if (gameState) {
      if (gameState.status === 'lobby') {
        setCurrentStage('lobby')
      } else if (gameState.status === 'setup') {
        setCurrentStage('setup')
      } else if (gameState.status === 'active') {
        setCurrentStage('arena')
      }
    }
  }, [gameState])

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

    const wsUrl = `ws://${window.location.hostname}:8000/ws/cross-clue/${sessionId}`
    
    const websocket = new WebSocket(wsUrl)
    wsRef.current = websocket

    websocket.onopen = () => {
      setConnected(true)
    }

    websocket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        
        // Handle card_drawn messages (private secret card)
        if (parsed.type === 'card_drawn') {
          const coordinate = parsed.data.coordinate
          setSecretCard(coordinate)
        }
        // Handle secret_update messages (alternative private secret card format)
        else if (parsed.type === 'secret_update') {
          const coordinate = parsed.secret_card
          setSecretCard(coordinate)
        }
        // Handle state_update messages (public game state)
        else if (parsed.type === 'state_update' && parsed.data) {
          setGameState(parsed.data)
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

  const handleLeave = () => {
    navigate('/')
  }

  // Derive players array from gameState.players object
  const playerArray = Object.keys(gameState?.players || {}).map(id => ({
    id,
    name: gameState.players[id]?.username || id,
    isReady: gameState.players[id]?.is_ready || false
  }))

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

  // Render based on current stage
  const renderStageContent = () => {
    switch (currentStage) {
      case 'lobby':
        return (
          <LobbyStage
            isHost={isHost}
            players={playerArray}
            gameConfig={{ mode: 'cooperative', grid: '5x5' }}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
          />
        )
      case 'setup':
        return (
          <CrossClueSetup
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
            onTransitionToArena={() => setCurrentStage('arena')}
          />
        )
      case 'arena':
        return (
          <CrossClueArena
            gameState={gameState}
            userId={userId}
            sendMessage={sendMessage}
            secretCard={secretCard}
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
      onLeave={handleLeave}
    >
      {renderStageContent()}
    </ModuxLayout>
  )
}

export default CrossClue
