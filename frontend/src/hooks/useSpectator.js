import { useMemo } from 'react';

/**
 * Hook to determine if current user is a spectator
 * @param {Object} gameState - Current game state
 * @param {string} userId - Current user ID
 * @returns {Object} - Spectator information
 */
export const useSpectator = (gameState, userId) => {
  return useMemo(() => {
    const currentPlayer = gameState?.players?.[userId];
    const isSpectator = currentPlayer?.is_spectator || false;
    
    return {
      isSpectator,
      currentPlayer,
      spectatorMessage: "The game has already started. Wait for the next round to join as a player."
    };
  }, [gameState, userId]);
};
