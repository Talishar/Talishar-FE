import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PlayerInputPopUp from '../PlayerInputPopUp';
import { sanitizeHtml } from 'utils/sanitizeHtml';

// Mock the sanitizeHtml function
jest.mock('utils/sanitizeHtml', () => ({
  sanitizeHtml: jest.fn((html) => html)
}));

// Mock ParseEscapedString
jest.mock('utils/ParseEscapedString', () => ({
  replaceText: jest.fn((text) => text)
}));

// Mock modal hook
jest.mock('hooks/useShowModals', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock components
jest.mock('../components/OptInput', () => ({
  OptInput: function MockOptInput() {
    return <div data-testid="opt-input">Opt Input</div>;
  }
}));

jest.mock('../components/NewOptInput', () => ({
  NewOptInput: function MockNewOptInput() {
    return <div data-testid="new-opt-input">New Opt Input</div>;
  }
}));

jest.mock('../components/OtherInput', () => ({
  OtherInput: function MockOtherInput() {
    return <div data-testid="other-input">Other Input</div>;
  }
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: (state = {
        gameInfo: { gameID: 1, playerID: 1, authKey: 'test-key' },
        inputPopUp: {
          popup: {
            id: 'OPT',
            title: 'Choose an option'
          },
          multiChooseText: []
        },
        ...initialState.game
      }) => state
    },
    preloadedState: initialState
  });
};

describe('PlayerInputPopUp Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Title Sanitization', () => {
    it('should sanitize malicious title content', () => {
      const maliciousTitle = '<script>alert("XSS")</script>Choose option';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: maliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      // Verify that sanitizeHtml was called with the malicious title
      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousTitle);
    });

    it('should sanitize title with dangerous attributes', () => {
      const dangerousTitle = '<div onclick="alert(\'XSS\')">Click me</div>Choose option';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: dangerousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(dangerousTitle);
    });

    it('should sanitize title with javascript: URLs', () => {
      const jsUrlTitle = '<a href="javascript:alert(\'XSS\')">Link</a>Choose option';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: jsUrlTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(jsUrlTitle);
    });

    it('should handle empty title', () => {
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: ''
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith('');
    });

    it('should handle null/undefined title', () => {
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: null
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith('');
    });
  });

  describe('Different Popup Types', () => {
    it('should sanitize title for OPT popup type', () => {
      const maliciousTitle = '<script>alert("XSS")</script>OPT Title';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: maliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousTitle);
    });

    it('should sanitize title for NEWOPT popup type', () => {
      const maliciousTitle = '<script>alert("XSS")</script>NEWOPT Title';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'NEWOPT',
              title: maliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousTitle);
    });

    it('should sanitize title for HANDTOPBOTTOM popup type', () => {
      const maliciousTitle = '<script>alert("XSS")</script>HANDTOPBOTTOM Title';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'HANDTOPBOTTOM',
              title: maliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousTitle);
    });

    it('should sanitize title for unknown popup type', () => {
      const maliciousTitle = '<script>alert("XSS")</script>Unknown Title';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'UNKNOWN',
              title: maliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(maliciousTitle);
    });
  });

  describe('Multi-Choose Text Security', () => {
    it('should handle malicious multi-choose text options', () => {
      const maliciousOptions = [
        { input: 0, label: '<script>alert("XSS")</script>Option 1' },
        { input: 1, label: '<div onclick="alert(\'XSS\')">Option 2</div>' }
      ];
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: 'Choose option'
            },
            multiChooseText: maliciousOptions
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      // The component should render without crashing
      expect(screen.getByText('<script>alert("XSS")</script>Option 1')).toBeInTheDocument();
      expect(screen.getByText('<div onclick="alert(\'XSS\')">Option 2</div>')).toBeInTheDocument();
    });

    it('should handle empty multi-choose text array', () => {
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: 'Choose option'
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith('Choose option');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long malicious titles', () => {
      const longMaliciousTitle = '<script>' + 'alert("XSS");'.repeat(1000) + '</script>Very long title...';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: longMaliciousTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(longMaliciousTitle);
    });

    it('should handle special characters in titles', () => {
      const specialCharsTitle = 'Title with émojis 🎮 and spëcial çharacters <script>alert("XSS")</script>';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: specialCharsTitle
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith(specialCharsTitle);
    });

    it('should handle missing popup object', () => {
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: null,
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith('');
    });

    it('should handle missing popup title', () => {
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT'
              // No title property
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      expect(sanitizeHtml).toHaveBeenCalledWith('');
    });
  });

  describe('Integration with replaceText', () => {
    it('should call replaceText before sanitizeHtml', () => {
      const { replaceText } = require('utils/ParseEscapedString');
      const title = '{{card|Card Name|1}}';
      
      const mockStore = createMockStore({
        game: {
          inputPopUp: {
            popup: {
              id: 'OPT',
              title: title
            },
            multiChooseText: []
          }
        }
      });

      render(
        <Provider store={mockStore}>
          <PlayerInputPopUp />
        </Provider>
      );

      // Should call replaceText first, then sanitizeHtml
      expect(replaceText).toHaveBeenCalledWith(title);
      expect(sanitizeHtml).toHaveBeenCalledWith(title);
    });
  });
});
