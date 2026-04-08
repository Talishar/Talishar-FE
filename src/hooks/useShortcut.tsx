import { useCallback } from 'react';

const MOUSE_BUTTON_CODES: Record<string, number> = {
  MiddleClick: 1
};

const shortcutListeners = new Map<string, (event: Event) => void>();
const shortcutCallbackRefs = new Map<string, { current: Function }>();

const useShortcut = (keyCode: string, callback: Function) => {
  const isMouseShortcut = keyCode in MOUSE_BUTTON_CODES;
  const eventType = isMouseShortcut ? 'mousedown' : 'keydown';

  if (!shortcutCallbackRefs.has(keyCode)) {
    shortcutCallbackRefs.set(keyCode, { current: callback });
  } else {
    shortcutCallbackRefs.get(keyCode)!.current = callback;
  }

  if (!shortcutListeners.has(keyCode)) {
    const callbackRef = shortcutCallbackRefs.get(keyCode)!;

    const handleEvent = (event: Event) => {
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
        callbackRef.current(event);
        event.preventDefault(); // prevent default behavior
      }
    };

    shortcutListeners.set(keyCode, handleEvent);
    window.addEventListener(eventType, handleEvent);
  }

  return () => {
    window.removeEventListener(eventType, shortcutListeners.get(keyCode)!);
  };
};

export default useShortcut;
