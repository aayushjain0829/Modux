import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../../../context/UserContext'

function CrossClueArena({ gameState, userId, sendMessage, secretCard }) {
  const [clueInput, setClueInput] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [guessResult, setGuessResult] = useState(null)

  // Handle clue submission
  const handleClueSubmit = (e) => {
    e.preventDefault()
    if (clueInput.trim()) {
      sendMessage({
        action: 'submit_clue',
        user_id: userId,
        clue: clueInput.trim()
      })
      setClueInput('')
    }
  }

  // Handle cell click for guessing
  const handleCellClick = (coordinate) => {
    setSelectedCell(coordinate)
    sendMessage({
      action: 'guess_coordinate',
      user_id: userId,
      guess: coordinate
    })
  }

  // Get cell state from game state
  const getCellState = (row, col) => {
    const coordinate = `${String.fromCharCode(65 + row)}${col + 1}`
    const cellState = gameState?.grid_state?.[coordinate]
    
    // Check if cell is marked as success/fail
    if (cellState === 'success') {
      return {
        revealed: true,
        content: coordinate,
        isSecret: coordinate === secretCard,
        isSuccess: true
      }
    }
    
    if (cellState === 'fail') {
      return {
        revealed: true,
        content: coordinate,
        isSecret: false,
        isSuccess: false
      }
    }
    
    return { revealed: false }
  }

  // Render grid cell
  const renderCell = (row, col) => {
    const coordinate = `${String.fromCharCode(65 + row)}${col + 1}`
    const cellState = getCellState(row, col)
    
    return (
      <div
        key={coordinate}
        onClick={() => !cellState.revealed && handleCellClick(coordinate)}
        style={{
          width: '60px',
          height: '60px',
          border: '2px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: cellState.revealed 
            ? (cellState.isSuccess ? '#28a745' : '#dc3545')
            : 'white',
          cursor: cellState.revealed ? 'default' : 'pointer',
          transition: 'all 0.2s',
          fontSize: '0.8rem',
          fontWeight: cellState.revealed ? 'bold' : 'normal',
          color: cellState.revealed ? 'white' : '#666'
        }}
        onMouseOver={(e) => {
          if (!cellState.revealed) {
            e.target.style.backgroundColor = '#f0f0f0';
          }
        }}
        onMouseOut={(e) => {
          if (!cellState.revealed) {
            e.target.style.backgroundColor = 'white';
          }
        }}
      >
        {cellState.revealed ? '' : coordinate}
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Game Header */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          color: '#333',
          marginBottom: '10px'
        }}>
          Cross Clue Arena
        </h1>
        <p style={{
          color: '#666',
          margin: 0
        }}>
          Work together to reveal all coordinates!
        </p>
      </div>

      {/* Secret Card Reminder */}
      {secretCard && (
        <div style={{
          background: '#e8f5e8',
          border: '2px solid #28a745',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Your Secret:</strong> {secretCard}
        </div>
      )}

      {/* Game Grid */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 60px)',
          gap: '4px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => renderCell(row, col))
          )}
        </div>
      </div>

      {/* Clue Input */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          color: '#333',
          marginBottom: '15px'
        }}>
          Submit a Clue
        </h3>
        <form onSubmit={handleClueSubmit}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={clueInput}
              onChange={(e) => setClueInput(e.target.value)}
              placeholder="Enter a one-word clue..."
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Game Status */}
      {guessResult && (
        <div style={{
          background: guessResult.correct ? '#d4edda' : '#f8d7da',
          border: `2px solid ${guessResult.correct ? '#28a745' : '#dc3545'}`,
          borderRadius: '8px',
          padding: '15px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          {guessResult.correct ? 'Correct! 🎉' : 'Try again!'}
        </div>
      )}
    </div>
  )
}

export default CrossClueArena
