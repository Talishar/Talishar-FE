import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EndGameScreen from '../EndGameScreen';
import { sanitizeHtml } from 'utils/sanitizeHtml';

// Mock the sanitizeHtml function
jest.mock('utils/sanitizeHtml', () => ({
  sanitizeHtml: jest.fn((html) => html)
}));

// Mock API slice
jest.mock('features/api/apiSlice', () => ({
  useGetPopUpContentQuery: jest.fn(() => ({
    data: {
      fullLog: '<script>alert("XSS")</script>Game log content'
    },
    isLoading: false,
    error: null
  }))
}));

// Mock auth hook
jest.mock('hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isPatron: true
  }))
}));

// Mock modal hook
jest.mock('hooks/useShowModals', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}));

// Mock EndGameStats component
jest.mock('../endGameStats/EndGameStats', () => ({
  __esModule: true,
  default: function MockEndGameStats() {
    return <div data-testid="end-game-stats">End Game Stats</div>;
  }
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: (state = {
        gameInfo: { gameID: 1, playerID: 1, authKey: 'test-key' },
        ...initialState.game
      }) => state
    },
    preloadedState: initialState
  });
};

describe('EndGameScreen Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Log XSS Prevention', () => {
    it('should sanitize malicious full log content for patrons', () => {
      const maliciousLog = '<script>alert("XSS")</script>Game log content';
      
      // Mock the API to return malicious content
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: maliciousLog },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      // Click the Full Game Log button to show the log
      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      // Verify that sanitizeHtml was called with the malicious content
      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousLog);
    });

    it('should sanitize full log content with dangerous attributes', () => {
      const dangerousLog = '<div onclick="alert(\'XSS\')">Click me</div>Game log';
      
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: dangerousLog },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith(dangerousLog);
    });

    it('should handle empty full log content', () => {
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: '' },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith('');
    });

    it('should handle null/undefined full log content', () => {
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: null },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith(null);
    });
  });

  describe('Non-Patron Security', () => {
    it('should not show full log for non-patrons', () => {
      // Mock non-patron user
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: '<script>alert("XSS")</script>' },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      // Should not call sanitizeHtml since content is not shown
      expect(sanitizeHtml).not.toHaveBeenCalled();
      
      // Should show patron message instead
      expect(screen.getByText(/Support our/)).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading state without calling sanitizeHtml', () => {
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      expect(sanitizeHtml).not.toHaveBeenCalled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle error state without calling sanitizeHtml', () => {
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'API Error' }
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      expect(sanitizeHtml).not.toHaveBeenCalled();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  describe('Player Switching Security', () => {
    it('should sanitize content when switching players', () => {
      const maliciousLog = '<script>alert("XSS")</script>Player 2 log';
      
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: maliciousLog },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      // Show full log first
      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      // Switch player
      const switchButton = screen.getByText('Switch player stats');
      switchButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousLog);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long malicious log content', () => {
      const longMaliciousLog = '<script>' + 'alert("XSS");'.repeat(1000) + '</script>' + 'Very long log content...';
      
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: longMaliciousLog },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith(longMaliciousLog);
    });

    it('should handle special characters in log content', () => {
      const specialCharsLog = 'Log with émojis 🎮 and spëcial çharacters <script>alert("XSS")</script>';
      
      const { useGetPopUpContentQuery } = require('features/api/apiSlice');
      useGetPopUpContentQuery.mockReturnValue({
        data: { fullLog: specialCharsLog },
        isLoading: false,
        error: null
      });

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <EndGameScreen />
        </Provider>
      );

      const fullLogButton = screen.getByText('Full Game Log');
      fullLogButton.click();

      expect(sanitizeHtml).toHaveBeenCalledWith(specialCharsLog);
    });
  });
});
