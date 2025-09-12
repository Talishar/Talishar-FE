import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatInput from '../ChatInput';
import { escapeHtml } from 'utils/sanitizeHtml';

// Mock the escapeHtml function
jest.mock('utils/sanitizeHtml', () => ({
  escapeHtml: jest.fn((text) => text) // Return input by default for testing
}));

// Mock API slice
jest.mock('features/api/apiSlice', () => ({
  useSubmitChatMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() }),
    { isLoading: false, error: null }
  ]),
  useChooseFirstPlayerMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() }),
    { isLoading: false, error: null }
  ]),
  useSubmitLobbyInputMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() }),
    { isLoading: false, error: null }
  ])
}));

// Mock floating UI
jest.mock('@floating-ui/react', () => ({
  useFloating: jest.fn(() => ({
    refs: { floating: { current: null }, reference: { current: null } },
    floatingStyles: {},
    context: {}
  })),
  autoUpdate: jest.fn(),
  offset: jest.fn(),
  flip: jest.fn(),
  shift: jest.fn(),
  useClick: jest.fn(),
  useDismiss: jest.fn(),
  useRole: jest.fn(),
  useInteractions: jest.fn(() => ({ getReferenceProps: jest.fn(), getFloatingProps: jest.fn() }))
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: (state = {
        gameInfo: { gameID: 1, playerID: 1, authKey: 'test-key' },
        chatEnabled: true,
        ...initialState.game
      }) => state
    },
    preloadedState: initialState
  });
};

describe('ChatInput Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Sanitization', () => {
    it('should escape HTML characters in chat input', async () => {
      const user = userEvent.setup();
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, maliciousInput);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(maliciousInput.trim());
        expect(mockSubmitChat).toHaveBeenCalledWith({
          gameID: 1,
          playerID: 1,
          authKey: 'test-key',
          chatText: maliciousInput.trim() // This should be the escaped version
        });
      });
    });

    it('should escape dangerous attributes in chat input', async () => {
      const user = userEvent.setup();
      const dangerousInput = '<div onclick="alert(\'XSS\')">Click me</div>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, dangerousInput);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(dangerousInput.trim());
      });
    });

    it('should escape javascript: URLs in chat input', async () => {
      const user = userEvent.setup();
      const jsUrlInput = '<a href="javascript:alert(\'XSS\')">Link</a>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, jsUrlInput);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(jsUrlInput.trim());
      });
    });

    it('should handle empty input without calling escapeHtml', async () => {
      const user = userEvent.setup();
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).not.toHaveBeenCalled();
        expect(mockSubmitChat).not.toHaveBeenCalled();
      });
    });

    it('should handle whitespace-only input without calling escapeHtml', async () => {
      const user = userEvent.setup();
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, '   ');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).not.toHaveBeenCalled();
        expect(mockSubmitChat).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Validation', () => {
    it('should trim whitespace from input before sanitization', async () => {
      const user = userEvent.setup();
      const inputWithWhitespace = '  <script>alert("XSS")</script>  ';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, inputWithWhitespace);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith('<script>alert("XSS")</script>');
      });
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      const specialCharsInput = 'Message with émojis 🎮 and spëcial çharacters <script>alert("XSS")</script>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, specialCharsInput);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(specialCharsInput.trim());
      });
    });
  });

  describe('Button Submission', () => {
    it('should sanitize input when submitted via button click', async () => {
      const user = userEvent.setup();
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, maliciousInput);
      
      const submitButton = screen.getByRole('button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(maliciousInput.trim());
      });
    });
  });

  describe('Spectator Mode', () => {
    it('should not render input for spectator (playerID 3)', () => {
      const mockStore = createMockStore({
        game: {
          gameInfo: { gameID: 1, playerID: 3, authKey: 'test-key' },
          chatEnabled: true
        }
      });
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      expect(screen.queryByPlaceholderText('Hit return to send')).not.toBeInTheDocument();
      expect(escapeHtml).not.toHaveBeenCalled();
    });
  });

  describe('Chat Disabled', () => {
    it('should not render input when chat is disabled', () => {
      const mockStore = createMockStore({
        game: {
          gameInfo: { gameID: 1, playerID: 1, authKey: 'test-key' },
          chatEnabled: false
        }
      });
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      expect(screen.queryByPlaceholderText('Hit return to send')).not.toBeInTheDocument();
      expect(escapeHtml).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const { useSubmitChatMutation } = require('features/api/apiSlice');
      const mockSubmitChat = jest.fn().mockRejectedValue(new Error('Submission failed'));
      useSubmitChatMutation.mockReturnValue([mockSubmitChat, { isLoading: false, error: null }]);

      const mockStore = createMockStore();
      
      render(
        <Provider store={mockStore}>
          <ChatInput />
        </Provider>
      );

      const chatInput = screen.getByPlaceholderText('Hit return to send');
      await user.type(chatInput, maliciousInput);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(escapeHtml).toHaveBeenCalledWith(maliciousInput.trim());
        expect(mockSubmitChat).toHaveBeenCalled();
      });
    });
  });
});
