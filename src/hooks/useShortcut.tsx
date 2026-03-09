import { useCallback } from 'react';

const MOUSE_BUTTON_CODES: Record<string, number> = {
  MiddleClick: 1
};

const shortcutListeners = new Map<string, (event: Event) => void>();

const useShortcut = (keyCode: string, callback: Function) => {
  const isMouseShortcut = keyCode in MOUSE_BUTTON_CODES;
  const eventType = isMouseShortcut ? 'mousedown' : 'keydown';

  const handleEvent = useCallback(
    (event: Event) => {
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

      const isMatch = isMouseShortcut
        ? (event as MouseEvent).button === MOUSE_BUTTON_CODES[keyCode]
        : (event as KeyboardEvent).code === keyCode;

      if (isMatch) {
        callback(event);
        event.preventDefault(); // prevent default behavior
      }
    },
    [keyCode, callback]
  );

  if (!shortcutListeners.has(keyCode)) {
    shortcutListeners.set(keyCode, handleEvent);
    window.addEventListener(eventType, handleEvent);
  }

  return () => {
    window.removeEventListener(eventType, handleEvent);
  };
};

export default useShortcut;