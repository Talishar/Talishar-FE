import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import gameSlice, { setGameInfo } from '../GameSlice';

// Mock the LocalKeyManagement module
vi.mock('utils/LocalKeyManagement', () => ({
  saveGameAuthKey: vi.fn(),
  loadGameAuthKey: vi.fn(() => ''),
  deleteGameAuthKey: vi.fn()
}));

describe('GameSlice Security Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameSlice
      }
    });
    vi.clearAllMocks();
  });

  describe('Spectator Auth Key Generation', () => {
    it('should generate unique spectator auth keys', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3, // Spectator
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const state = store.getState().game;
      const authKey = state.gameInfo.authKey;

      // Should start with 'spectator_'
      expect(authKey).toMatch(/^spectator_/);
      
      // Should contain timestamp (numbers)
      expect(authKey).toMatch(/spectator_\d+/);
      
      // Should contain random string
      expect(authKey).toMatch(/spectator_\d+_[a-z0-9]+/);
    });

    it('should generate different auth keys for multiple spectators', () => {
      const initialState1 = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: ''
        }
      };

      const initialState2 = {
        gameInfo: {
          gameID: 2,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState1));
      const authKey1 = store.getState().game.gameInfo.authKey;

      store.dispatch(setGameInfo(initialState2));
      const authKey2 = store.getState().game.gameInfo.authKey;

      expect(authKey1).not.toBe(authKey2);
      expect(authKey1).toMatch(/^spectator_/);
      expect(authKey2).toMatch(/^spectator_/);
    });

    it('should generate auth keys with sufficient entropy', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      
      // Should be reasonably long (timestamp + random string)
      expect(authKey.length).toBeGreaterThan(20);
      
      // Should contain both numbers and letters
      expect(authKey).toMatch(/\d/);
      expect(authKey).toMatch(/[a-z]/);
    });

    it('should not generate spectator auth key for non-spectator players', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 1, // Not spectator
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      
      // Should not start with 'spectator_' for non-spectator players
      expect(authKey).not.toMatch(/^spectator_/);
    });

    it('should handle existing auth key for spectators', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: 'existing-key'
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      
      // Should keep existing key, not generate new one
      expect(authKey).toBe('existing-key');
    });
  });

  describe('Auth Key Security Properties', () => {
    it('should generate unpredictable auth keys', () => {
      const authKeys = new Set();
      
      // Generate multiple auth keys
      for (let i = 0; i < 100; i++) {
        const initialState = {
          gameInfo: {
            gameID: i,
            playerID: 3,
            authKey: ''
          }
        };
        
        store.dispatch(setGameInfo(initialState));
        const authKey = store.getState().game.gameInfo.authKey;
        authKeys.add(authKey);
      }

      // All keys should be unique
      expect(authKeys.size).toBe(100);
    });

    it('should generate auth keys that are not easily guessable', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      
      // Should not be simple patterns
      expect(authKey).not.toBe('spectator');
      expect(authKey).not.toBe('spectator_1');
      expect(authKey).not.toMatch(/^spectator_[0-9]+$/); // Should have random part too
    });

    it('should include timestamp for uniqueness', () => {
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: ''
        }
      };

      const beforeTime = Date.now();
      store.dispatch(setGameInfo(initialState));
      const afterTime = Date.now();

      const authKey = store.getState().game.gameInfo.authKey;
      const timestampMatch = authKey.match(/spectator_(\d+)_/);
      
      expect(timestampMatch).toBeTruthy();
      const timestamp = parseInt(timestampMatch![1]);
      
      // Timestamp should be within reasonable range
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive auth key generations', () => {
      const authKeys = [];
      
      for (let i = 0; i < 10; i++) {
        const initialState = {
          gameInfo: {
            gameID: i,
            playerID: 3,
            authKey: ''
          }
        };
        
        store.dispatch(setGameInfo(initialState));
        authKeys.push(store.getState().game.gameInfo.authKey);
      }

      // All keys should be unique even with rapid generation
      const uniqueKeys = new Set(authKeys);
      expect(uniqueKeys.size).toBe(authKeys.length);
    });

    it('should handle negative game IDs', () => {
      const initialState = {
        gameInfo: {
          gameID: -1,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      expect(authKey).toMatch(/^spectator_/);
    });

    it('should handle zero game ID', () => {
      const initialState = {
        gameInfo: {
          gameID: 0,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      const authKey = store.getState().game.gameInfo.authKey;
      expect(authKey).toMatch(/^spectator_/);
    });
  });

  describe('Integration with LocalKeyManagement', () => {
    it('should not call saveGameAuthKey for spectator keys', () => {
      const { saveGameAuthKey } = await import('utils/LocalKeyManagement');
      
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 3,
          authKey: ''
        }
      };

      store.dispatch(setGameInfo(initialState));

      // Should not save spectator keys to local storage
      expect(saveGameAuthKey).not.toHaveBeenCalled();
    });

    it('should call saveGameAuthKey for regular player keys', () => {
      const { saveGameAuthKey } = await import('utils/LocalKeyManagement');
      
      const initialState = {
        gameInfo: {
          gameID: 1,
          playerID: 1,
          authKey: 'regular-key'
        }
      };

      store.dispatch(setGameInfo(initialState));

      // Should save regular player keys
      expect(saveGameAuthKey).toHaveBeenCalledWith(1, 'regular-key');
    });
  });
});
