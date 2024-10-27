import { useCallback } from 'react';


const shortcutListeners = new Map<string, (event: KeyboardEvent) => void>();

const useShortcut = (keyCode: string, callback: Function) => {

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
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