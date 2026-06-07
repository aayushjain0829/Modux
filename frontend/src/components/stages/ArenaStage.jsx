import React from 'react'
import './ArenaStage.css'
import SpectatorView from '../common/SpectatorView'

function ArenaStage({ isSpectator, spectatorMessage, children }) {
  return (
    <div className="arena-stage">
      {isSpectator && (
        <SpectatorView message={spectatorMessage} />
      )}

      <div className="arena-content">
        {children}
      </div>
    </div>
  )
}

export default ArenaStage
