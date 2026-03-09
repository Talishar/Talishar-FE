import { useEffect, useRef } from 'react';

const MOUSE_BUTTON_CODES: Record<string, number> = {
  MiddleClick: 1
};

const useShortcut = (keyCode: string, callback: (event: Event) => void) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const isMouseShortcut = keyCode in MOUSE_BUTTON_CODES;
  const eventType = isMouseShortcut ? 'mousedown' : 'keydown';

  useEffect(() => {
    const handleEvent = (event: Event) => {
      // Check if user is typing in an input field, textarea, or contenteditable element
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      // Don't trigger shortcuts when user is typing
      if (isTyping) {
        return;
      }

      const isMatch = isMouseShortcut
        ? (event as MouseEvent).button === MOUSE_BUTTON_CODES[keyCode]
        : (event as KeyboardEvent).code === keyCode;

      if (isMatch) {
        callbackRef.current(event);
        event.preventDefault();
      }
    };

    window.addEventListener(eventType, handleEvent);
    return () => {
      window.removeEventListener(eventType, handleEvent);
    };
  }, [eventType, isMouseShortcut, keyCode]);
};

export default useShortcut;