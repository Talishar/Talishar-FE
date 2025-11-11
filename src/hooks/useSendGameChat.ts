import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { BACKEND_URL } from 'appConstants';
import { CHAT_WHEEL } from 'constants/chatMessages';

/**
 * Hook to send persistent chat messages to the game log
 * Messages are written to gamelog.txt with proper player color formatting
 * 
 * Supports two modes:
 * 1. Quick chat messages from CHAT_WHEEL (predefined messages)
 * 2. Custom raw messages sent directly to backend
 * 
 * @returns Object with two functions:
 *   - sendQuickChat(message: string): Send predefined quick chat messages
 *   - sendCustomMessage(message: string): Send any custom message string
 * 
 * @example
 * const { sendQuickChat, sendCustomMessage } = useSendGameChat();
 * 
 * // Send predefined quick chat
 * sendQuickChat('Thinking... Please bear with me!');
 * sendQuickChat('Good game!');
 * 
 * // Send custom message
 * sendCustomMessage('⌛Player 1 is inactive.');
 * sendCustomMessage('Game restarted');
 */
export const useSendGameChat = () => {
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);

  // Create reverse mapping from message text to quick chat option number
  const quickChatMap: Record<string, string> = {};
  CHAT_WHEEL.forEach((message, optionNumber) => {
    quickChatMap[message] = String(optionNumber);
  });

  const sendQuickChat = (message: string, debug = false) => {
    const quickChatOption = quickChatMap[message];

    if (!quickChatOption) {
      console.error(`Unknown chat message: "${message}". Available messages:`, Array.from(CHAT_WHEEL.values()));
      return;
    }

    const params = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: gameInfo.authKey || '',
      quickChat: quickChatOption
    });

    if (debug) {
      console.log('Sending quick chat message:', message);
      console.log('Params:', params.toString());
    }

    fetch(`${BACKEND_URL}SubmitChat.php?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (debug) {
          console.log('SubmitChat response:', res.status, res.statusText);
        }
        return res.text();
      })
      .then(text => {
        if (debug) {
          console.log('SubmitChat response body:', text);
        }
      })
      .catch(e => console.error('Failed to send quick chat:', e));
  };

  const sendCustomMessage = (message: string, debug = false) => {
    const params = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: gameInfo.authKey || '',
      chatText: message
    });

    if (debug) {
      console.log('Sending custom message:', message);
      console.log('Params:', params.toString());
    }

    fetch(`${BACKEND_URL}SubmitChat.php?${params.toString()}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => {
        if (debug) {
          console.log('SubmitChat response:', res.status, res.statusText);
        }
        return res.text();
      })
      .then(text => {
        if (debug) {
          console.log('SubmitChat response body:', text);
        }
      })
      .catch(e => console.error('Failed to send custom message:', e));
  };

  return { sendQuickChat, sendCustomMessage };
};

