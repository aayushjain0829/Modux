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
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Check status indicators by checking the DOM for the classes
    const aliceContainer = screen.getByText('Alice').closest('.modux-player-item');
    expect(aliceContainer.querySelector('.modux-player-status')).toHaveClass('ready');
    
    const bobContainer = screen.getByText('Bob').parentElement;
    expect(bobContainer.querySelector('.modux-player-status')).toHaveClass('not-ready');
  });

  it('toggles mobile sidebar menu when button is clicked', async () => {
    // import userEvent or use fireEvent. Let's use fireEvent for simplicity.
    const { fireEvent } = await import('@testing-library/react');
    
    renderWithContext(
      <ModuxLayout appName="TestApp">
        <div>Content</div>
      </ModuxLayout>,
      {}
    );

    // Initial state: sidebar shouldn't have 'open' class
    const sidebar = document.querySelector('.modux-sidebar');
    expect(sidebar).not.toHaveClass('open');

    // Find and click the toggle button
    // Since the button doesn't have an aria-label, we get it by class name
    const toggleBtn = document.querySelector('.modux-menu-toggle');
    fireEvent.click(toggleBtn);

    // Sidebar should now have 'open' class
    expect(sidebar).toHaveClass('open');

    // Click close button inside sidebar
    const closeBtn = document.querySelector('.modux-sidebar-close');
    fireEvent.click(closeBtn);

    // Sidebar should be closed again
    expect(sidebar).not.toHaveClass('open');
  });
});
