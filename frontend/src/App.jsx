import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import CrossClueLanding from './apps/cross_clue/CrossClueLanding'
import CrossClue from './apps/cross_clue/CrossClue'
import BingoGame from './apps/bingo/BingoGame'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cross-clue" element={<CrossClueLanding />} />
        <Route path="/cross-clue/:sessionId" element={<CrossClue />} />
        <Route path="/bingo/:sessionId" element={<BingoGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
