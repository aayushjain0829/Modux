import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LobbyStage from './LobbyStage';

describe('LobbyStage Component Tests', () => {
  const mockPlayers = [
    { id: 'host-123', username: 'HostUser', is_ready: true, is_spectator: false },
    { id: 'player-456', username: 'PlayerTwo', is_ready: false, is_spectator: false }
  ];

  it('renders input fields for the Host to edit Cross Clue timers', () => {
    const gameState = {
      turn_timer: 60,
      game_timer: 300,
    };

    render(
      <LobbyStage
        gameType="cross_clue"
        isHost={true}
        players={mockPlayers}
        currentUserId="host-123"
        gameState={gameState}
        sendMessage={vi.fn()}
      />
    );

    // Host should see input elements for Turn Timer and Game Timer
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue(60);
    expect(inputs[1]).toHaveValue(300);
    
    // Host should see a Save button
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders read-only timer values for Non-Host players in Cross Clue', () => {
    const gameState = {
      turn_timer: 45,
      game_timer: 400,
    };

    render(
      <LobbyStage
        gameType="cross_clue"
        isHost={false}
        players={mockPlayers}
        currentUserId="player-456"
        gameState={gameState}
        sendMessage={vi.fn()}
      />
    );

    // Non-host should NOT see input fields
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    
    // Non-host should NOT see a Save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();

    // Non-host should see the raw timer numbers from gameState
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('6m 40s')).toBeInTheDocument();
  });
});
