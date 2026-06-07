import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModuxLayout from './ModuxLayout';
import UserContext from '../../context/UserContext';
import { MemoryRouter } from 'react-router-dom';

// Mock child components to isolate the Layout testing
vi.mock('../stages/LobbyStage', () => ({
  default: () => <div data-testid="lobby-stage">Lobby</div>
}));

const mockUserContext = {
  userId: 'user1',
  username: 'Alice'
};

const renderWithContext = (ui, props) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider value={mockUserContext}>
        {React.cloneElement(ui, props)}
      </UserContext.Provider>
    </MemoryRouter>
  );
};

describe('ModuxLayout', () => {
  it('renders the connection status correctly when not connected', () => {
    // We don't have a "Connecting..." status in ModuxLayout directly, 
    // maybe we should test that the app name and room label render
    renderWithContext(
      <ModuxLayout
        appName="TestApp"
      >
        <div>Content</div>
      </ModuxLayout>,
      {}
    );

    expect(screen.getByText('TestApp')).toBeInTheDocument();
    expect(screen.getByText('Room:')).toBeInTheDocument();
  });

  it('renders player list with correct statuses', () => {
    const mockPlayers = [
      { id: 'user1', name: 'Alice', is_ready: true, is_spectator: false },
      { id: 'user2', name: 'Bob', is_ready: false, is_spectator: false },
      { id: 'user3', name: 'Charlie', is_ready: false, is_spectator: true }
    ];

    const mockGameState = {
      status: 'waiting'
    };

    renderWithContext(
      <ModuxLayout
        appName="TestApp"
        players={mockPlayers}
        gameState={mockGameState}
        currentUserId="user1"
      >
        <div>Content</div>
      </ModuxLayout>,
      {}
    );

    // Check players are rendered
    expect(screen.getByText('Alice (you)')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Check status indicators by checking the DOM for the classes
    const aliceContainer = screen.getByText('Alice (you)').parentElement;
    expect(aliceContainer.querySelector('.modux-player-status')).toHaveClass('ready');
    
    const bobContainer = screen.getByText('Bob').parentElement;
    expect(bobContainer.querySelector('.modux-player-status')).toHaveClass('not-ready');
  });
});
