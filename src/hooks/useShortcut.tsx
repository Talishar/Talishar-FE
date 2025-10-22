import { useCallback } from 'react';


const shortcutListeners = new Map<string, (event: KeyboardEvent) => void>();

const useShortcut = (keyCode: string, callback: Function) => {

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input field, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      
      // Don't trigger shortcuts when user is typing
      if (isTyping) {
        return;
      }
      
      if (event.code === keyCode) {
        callback(event);
        event.preventDefault(); // prevent default behavior
      }
    },
    [keyCode, callback]
  );

  if (!shortcutListeners.has(keyCode)) {
    shortcutListeners.set(keyCode, handleKeyPress);
    window.addEventListener('keydown', handleKeyPress);
  }

  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
};

export default useShortcut;