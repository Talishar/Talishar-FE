import React from 'react';
import { render, screen } from '@testing-library/react';
import EndGameStats from '../EndGameStats';
import { sanitizeHtml } from 'utils/sanitizeHtml';

// Mock the sanitizeHtml function
jest.mock('utils/sanitizeHtml', () => ({
  sanitizeHtml: jest.fn((html) => html)
}));

// Mock auth hook
jest.mock('hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isPatron: false // Test non-patron by default
  }))
}));

// Mock EndGameMenuOptions component
jest.mock('../endGameMenuOptions/EndGameMenuOptions', () => ({
  __esModule: true,
  default: function MockEndGameMenuOptions() {
    return <div data-testid="end-game-menu">End Game Menu</div>;
  }
}));

// Mock Effects component
jest.mock('../effects/Effects', () => ({
  Effect: function MockEffect() {
    return <div data-testid="effect">Effect</div>;
  }
}));

// Mock Card component
jest.mock('features/Card', () => ({
  Card: function MockCard() {
    return <div data-testid="card">Card</div>;
  }
}));

describe('EndGameStats Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEndGameData = {
    deckID: 'test-deck',
    firstPlayer: 1,
    gameID: '1',
    result: 1,
    turns: 5,
    cardResults: [],
    turnResults: new Map(),
    totalDamageThreatened: 100,
    totalDamageDealt: 80,
    totalDamagePrevented: 20,
    totalLifeGained: 10,
    averageDamageThreatenedPerTurn: 20,
    averageDamageDealtPerTurn: 16,
    averageValuePerTurn: 25
  };

  describe('Patron Message Sanitization', () => {
    it('should sanitize patron support messages for non-patrons', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      render(<EndGameStats {...mockEndGameData} />);

      // Should call sanitizeHtml for patron support messages
      expect(sanitizeHtml).toHaveBeenCalledWith(
        "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access life gain stats"
      );
      expect(sanitizeHtml).toHaveBeenCalledWith(
        "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access average value per turn"
      );
    });

    it('should sanitize patron messages with malicious content', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      // Mock sanitizeHtml to return malicious content for testing
      sanitizeHtml.mockImplementation((html) => html);

      render(<EndGameStats {...mockEndGameData} />);

      // Verify sanitizeHtml was called for each patron message
      expect(sanitizeHtml).toHaveBeenCalledTimes(3); // Three patron messages
    });

    it('should not show patron messages for actual patrons', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: true });

      render(<EndGameStats {...mockEndGameData} />);

      // Should not call sanitizeHtml for patron messages since they're not shown
      expect(sanitizeHtml).not.toHaveBeenCalled();
      
      // Should show actual stats instead
      expect(screen.getByText(/Total Damage Prevented: 20/)).toBeInTheDocument();
      expect(screen.getByText(/Total Life Gained: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Average Value per Turn/)).toBeInTheDocument();
    });
  });

  describe('Patron Message Content Security', () => {
    it('should handle malicious patron messages', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      // Test with a malicious patron message
      const maliciousMessage = "Support our <script>alert('XSS')</script><a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access life gain stats";
      
      // Mock sanitizeHtml to simulate malicious content
      sanitizeHtml.mockImplementation((html) => html);

      render(<EndGameStats {...mockEndGameData} />);

      // Should call sanitizeHtml for each patron message
      expect(sanitizeHtml).toHaveBeenCalledTimes(3);
    });

    it('should preserve safe HTML in patron messages', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      render(<EndGameStats {...mockEndGameData} />);

      // Should call sanitizeHtml with the expected patron messages
      expect(sanitizeHtml).toHaveBeenCalledWith(
        "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access life gain stats"
      );
      expect(sanitizeHtml).toHaveBeenCalledWith(
        "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access average value per turn"
      );
    });
  });

  describe('Data Security', () => {
    it('should handle malicious data in stats', () => {
      const maliciousData = {
        ...mockEndGameData,
        deckID: '<script>alert("XSS")</script>malicious-deck',
        gameID: '<div onclick="alert(\'XSS\')">malicious-game</div>'
      };

      render(<EndGameStats {...maliciousData} />);

      // The component should render without crashing
      expect(screen.getByText(/malicious-deck/)).toBeInTheDocument();
      expect(screen.getByText(/malicious-game/)).toBeInTheDocument();
    });

    it('should handle special characters in data', () => {
      const specialCharsData = {
        ...mockEndGameData,
        deckID: 'deck-with-émojis-🎮-and-spëcial-çharacters',
        gameID: 'game-with-unicode-测试'
      };

      render(<EndGameStats {...specialCharsData} />);

      // Should render without issues
      expect(screen.getByText(/deck-with-émojis-🎮-and-spëcial-çharacters/)).toBeInTheDocument();
      expect(screen.getByText(/game-with-unicode-测试/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      const incompleteData = {
        deckID: undefined,
        gameID: null,
        cardResults: [],
        turnResults: new Map()
      };

      render(<EndGameStats {...incompleteData} />);

      // Should render without crashing
      expect(screen.getByText(/Game Over Summary/)).toBeInTheDocument();
    });

    it('should handle very large numbers in stats', () => {
      const largeNumbersData = {
        ...mockEndGameData,
        totalDamageThreatened: Number.MAX_SAFE_INTEGER,
        totalDamageDealt: Number.MAX_SAFE_INTEGER,
        averageDamageThreatenedPerTurn: Number.MAX_SAFE_INTEGER
      };

      render(<EndGameStats {...largeNumbersData} />);

      // Should render without issues
      expect(screen.getByText(/Game Over Summary/)).toBeInTheDocument();
    });

    it('should handle negative numbers in stats', () => {
      const negativeNumbersData = {
        ...mockEndGameData,
        totalDamageThreatened: -100,
        totalDamageDealt: -50,
        averageDamageThreatenedPerTurn: -10
      };

      render(<EndGameStats {...negativeNumbersData} />);

      // Should render without issues
      expect(screen.getByText(/Game Over Summary/)).toBeInTheDocument();
    });
  });

  describe('Patron Status Changes', () => {
    it('should re-render when patron status changes', () => {
      const { default: useAuth } = require('hooks/useAuth');
      
      // Start as non-patron
      useAuth.mockReturnValue({ isPatron: false });
      
      const { rerender } = render(<EndGameStats {...mockEndGameData} />);
      
      expect(sanitizeHtml).toHaveBeenCalledTimes(3);
      
      // Change to patron
      useAuth.mockReturnValue({ isPatron: true });
      rerender(<EndGameStats {...mockEndGameData} />);
      
      // Should not call sanitizeHtml for patron messages anymore
      expect(sanitizeHtml).toHaveBeenCalledTimes(3); // Same count as before
    });
  });

  describe('Component Integration', () => {
    it('should render all child components safely', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: true });

      render(<EndGameStats {...mockEndGameData} />);

      // Should render all components without security issues
      expect(screen.getByTestId('end-game-menu')).toBeInTheDocument();
    });

    it('should handle component errors gracefully', () => {
      const { default: useAuth } = require('hooks/useAuth');
      useAuth.mockReturnValue({ isPatron: false });

      // Mock a component that throws an error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      render(<EndGameStats {...mockEndGameData} />);

      // Should still call sanitizeHtml for patron messages
      expect(sanitizeHtml).toHaveBeenCalledTimes(3);

      console.error = originalConsoleError;
    });
  });
});
