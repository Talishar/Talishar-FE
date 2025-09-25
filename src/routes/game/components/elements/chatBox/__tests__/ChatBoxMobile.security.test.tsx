import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatBoxMobile from '../ChatBoxMobile';
import { sanitizeHtml } from 'utils/sanitizeHtml';

// Mock the sanitizeHtml function to track calls
jest.mock('utils/sanitizeHtml', () => ({
  sanitizeHtml: jest.fn((html) => html) // Return input by default for testing
}));

// Mock other dependencies
jest.mock('utils/ParseEscapedString', () => ({
  replaceText: jest.fn((text) => text)
}));

jest.mock('../chatInput/ChatInput', () => {
  return function MockChatInput() {
    return <div data-testid="chat-input">Chat Input</div>;
  };
});

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: (state = {
        gameInfo: { playerID: 1 },
        playerOne: { Name: 'Player One' },
        playerTwo: { Name: 'Player Two' },
        chatLog: [],
        ...initialState.game
      }) => state
    },
    preloadedState: initialState
  });
};

describe('ChatBoxMobile Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('XSS Prevention', () => {
    it('should sanitize malicious chat messages', () => {
      const maliciousChat = '<script>alert("XSS")</script>';
      const mockStore = createMockStore({
        game: {
          chatLog: [maliciousChat]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Verify that sanitizeHtml was called with the malicious content
      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousChat);
    });

    it('should sanitize chat messages with dangerous attributes', () => {
      const dangerousChat = '<div onclick="alert(\'XSS\')">Click me</div>';
      const mockStore = createMockStore({
        game: {
          chatLog: [dangerousChat]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(dangerousChat);
    });

    it('should sanitize multiple chat messages', () => {
      const chatMessages = [
        'Normal message',
        '<script>alert("XSS")</script>',
        '<a href="javascript:alert(\'XSS\')">Link</a>'
      ];
      
      const mockStore = createMockStore({
        game: {
          chatLog: chatMessages
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Should be called for each message
      expect(sanitizeHtml).toHaveBeenCalledTimes(chatMessages.length);
      chatMessages.forEach(message => {
        expect(sanitizeHtml).toHaveBeenCalledWith(message);
      });
    });

    it('should handle empty chat log safely', () => {
      const mockStore = createMockStore({
        game: {
          chatLog: []
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Should not call sanitizeHtml for empty array
      expect(sanitizeHtml).not.toHaveBeenCalled();
    });

    it('should handle null/undefined chat messages', () => {
      const mockStore = createMockStore({
        game: {
          chatLog: [null, undefined, '']
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Should still call sanitizeHtml for each item
      expect(sanitizeHtml).toHaveBeenCalledTimes(3);
    });
  });

  describe('Player Name Replacement Security', () => {
    it('should sanitize player name replacements', () => {
      const chatWithPlayerNames = 'Player 1 attacks Player 2';
      const mockStore = createMockStore({
        game: {
          chatLog: [chatWithPlayerNames],
          playerOne: { Name: 'Alice' },
          playerTwo: { Name: 'Bob' }
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should handle malicious player names', () => {
      const maliciousPlayerName = '<script>alert("XSS")</script>';
      const mockStore = createMockStore({
        game: {
          chatLog: ['Player 1 attacks'],
          playerOne: { Name: maliciousPlayerName },
          playerTwo: { Name: 'Bob' }
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalled();
    });
  });

  describe('Chat Filter Security', () => {
    it('should sanitize messages when filtering by chat', () => {
      const chatMessages = [
        '<span>Player 1:</span> Hello',
        '<script>alert("XSS")</script>',
        'Game log message'
      ];
      
      const mockStore = createMockStore({
        game: {
          chatLog: chatMessages
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Click chat filter button
      const chatButton = screen.getByText('Chat');
      chatButton.click();

      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should sanitize messages when filtering by log', () => {
      const chatMessages = [
        '<span>Player 1:</span> Hello',
        'Game log message <script>alert("XSS")</script>'
      ];
      
      const mockStore = createMockStore({
        game: {
          chatLog: chatMessages
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Click log filter button
      const logButton = screen.getByText('Log');
      logButton.click();

      expect(sanitizeHtml).toHaveBeenCalled();
    });
  });

  describe('Mobile-Specific Security', () => {
    it('should handle touch events safely', () => {
      const maliciousChat = '<div ontouchstart="alert(\'XSS\')">Touch me</div>';
      const mockStore = createMockStore({
        game: {
          chatLog: [maliciousChat]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousChat);
    });

    it('should handle mobile-specific HTML attributes', () => {
      const mobileChat = '<input type="tel" onfocus="alert(\'XSS\')" placeholder="Phone">';
      const mockStore = createMockStore({
        game: {
          chatLog: [mobileChat]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(mobileChat);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long malicious messages', () => {
      const longMaliciousMessage = '<script>' + 'alert("XSS");'.repeat(1000) + '</script>';
      const mockStore = createMockStore({
        game: {
          chatLog: [longMaliciousMessage]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(longMaliciousMessage);
    });

    it('should handle special characters in chat messages', () => {
      const specialCharsMessage = 'Message with émojis 🎮 and spëcial çharacters';
      const mockStore = createMockStore({
        game: {
          chatLog: [specialCharsMessage]
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(specialCharsMessage);
    });

    it('should handle mixed content types', () => {
      const mixedContent = [
        'Plain text message',
        '<span style="color: red;">Styled message</span>',
        '<script>alert("XSS")</script>',
        '<a href="https://example.com">Safe link</a>',
        '<div onclick="alert(\'XSS\')">Dangerous div</div>'
      ];
      
      const mockStore = createMockStore({
        game: {
          chatLog: mixedContent
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Should sanitize all messages
      expect(sanitizeHtml).toHaveBeenCalledTimes(mixedContent.length);
      mixedContent.forEach(message => {
        expect(sanitizeHtml).toHaveBeenCalledWith(message);
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of messages efficiently', () => {
      const manyMessages = Array.from({ length: 1000 }, (_, i) => 
        `Message ${i} <script>alert("XSS ${i}")</script>`
      );
      
      const mockStore = createMockStore({
        game: {
          chatLog: manyMessages
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Should sanitize all messages
      expect(sanitizeHtml).toHaveBeenCalledTimes(manyMessages.length);
    });

    it('should handle rapid filter changes', () => {
      const chatMessages = [
        '<span>Player 1:</span> Hello',
        '<script>alert("XSS")</script>',
        'Game log message'
      ];
      
      const mockStore = createMockStore({
        game: {
          chatLog: chatMessages
        }
      });

      render(
        <Provider store={mockStore}>
          <ChatBoxMobile />
        </Provider>
      );

      // Rapidly change filters
      const chatButton = screen.getByText('Chat');
      const logButton = screen.getByText('Log');
      const allButton = screen.getByText('All');

      chatButton.click();
      logButton.click();
      allButton.click();
      chatButton.click();

      // Should sanitize messages for each filter change
      expect(sanitizeHtml).toHaveBeenCalled();
    });
  });
});
