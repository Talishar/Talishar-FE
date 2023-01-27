import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const useShortcut = (keyCode: String, callback: Function) => {
  // callback ref pattern
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === keyCode) {
        callbackRef.current(event);
      }
    },
    [keyCode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

export default useShortcut;
