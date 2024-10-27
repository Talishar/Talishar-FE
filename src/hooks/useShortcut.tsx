import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BACKEND_URL } from 'appConstants';


const shortcutListeners = new Map<string, (event: KeyboardEvent) => void>();

const useShortcut = (keyCode: string, callback: Function) => {
  const location = useLocation();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = location.pathname !== BACKEND_URL && !location.pathname.startsWith('/user/profile');
    setIsEnabled(isEnabled);
  }, [location.pathname]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isEnabled && event.code === keyCode) {
        callback(event);
        event.preventDefault(); // prevent default behavior
      }
    },
    [keyCode, callback, isEnabled]
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