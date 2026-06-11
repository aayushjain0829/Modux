import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import GameErrorBoundary from './components/common/GameErrorBoundary'
import Dashboard from './components/Dashboard'
import Portal from './components/Portal'
import CrossClue from './apps/cross_clue/CrossClue'
import BingoGame from './apps/bingo/BingoGame'
import TicTacToeGame from './apps/tic_tac_toe/TicTacToeGame'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '12px 20px',
          },
          success: {
            iconTheme: { primary: '#20c997', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc3545', secondary: '#fff' },
          }
        }}
      />
      <GameErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portal/:appName" element={<Portal />} />
          <Route path="/cross-clue/:sessionId" element={<CrossClue />} />
          <Route path="/bingo/:sessionId" element={<BingoGame />} />
          <Route path="/tic_tac_toe/:sessionId" element={<TicTacToeGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameErrorBoundary>
    </Router>
  )
}

export default App
