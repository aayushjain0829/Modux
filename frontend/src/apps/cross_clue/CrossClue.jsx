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

function CrossClue() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { username, userId } = useUser()
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [secretCard, setSecretCard] = useState(null)
  const [currentStage, setCurrentStage] = useState('lobby') // lobby, setup, arena, recap
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
          <SetupStage />
        )
      case 'arena':
        return (
          <ArenaStage isSpectator={false} />
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
        appName="Cross Clue"
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
  )
}

export default CrossClue
