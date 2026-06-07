import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameSocket } from './useGameSocket';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn(() => 'test-toast-id'),
    success: vi.fn(),
    dismiss: vi.fn(),
  }
}));

describe('useGameSocket', () => {
  let mockWebSocket;

  beforeEach(() => {
    // Setup WebSocket mock
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
    };

    global.WebSocket = vi.fn(() => mockWebSocket);
    global.WebSocket.OPEN = 1;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes connection and sends join_game on open', () => {
    const { result } = renderHook(() => 
      useGameSocket('bingo', 'session1', 'user1', 'Alice')
    );

    expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws/bingo/session1'));
    expect(result.current.isConnected).toBe(false);

    // Simulate connection open
    act(() => {
      mockWebSocket.onopen();
    });

    expect(result.current.isConnected).toBe(true);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        action: 'join_game',
        user_id: 'user1',
        username: 'Alice'
      })
    );
  });

  it('updates game state when receiving state_update message', () => {
    const { result } = renderHook(() => 
      useGameSocket('bingo', 'session1', 'user1', 'Alice')
    );

    // Simulate connection open
    act(() => {
      mockWebSocket.onopen();
    });

    const mockState = { status: 'waiting', players: {} };

    // Simulate receiving message
    act(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'state_update',
          data: mockState
        })
      });
    });

    expect(result.current.gameState).toEqual(mockState);
  });

  it('provides sendAction function that sends formatted messages', () => {
    const { result } = renderHook(() => 
      useGameSocket('bingo', 'session1', 'user1', 'Alice')
    );

    // Simulate connection open
    act(() => {
      mockWebSocket.onopen();
    });

    // Send action
    act(() => {
      result.current.sendMessage('toggle_ready', { extra: 'data' });
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        action: 'toggle_ready',
        user_id: 'user1',
        extra: 'data'
      })
    );
  });
});
