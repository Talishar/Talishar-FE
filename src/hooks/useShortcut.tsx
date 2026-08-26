import { useEffect, useRef } from 'react';

const MOUSE_BUTTON_CODES: Record<string, number> = {
  MiddleClick: 1
};

type ShortcutCallback = (event: KeyboardEvent | MouseEvent) => void;

type ShortcutSubscription = {
  callback: React.MutableRefObject<ShortcutCallback>;
};

type ShortcutEntry = {
  eventType: 'keydown' | 'mousedown';
  listener: (event: Event) => void;
  subscriptions: ShortcutSubscription[];
};

const shortcuts = new Map<string, ShortcutEntry>();

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return target.closest('input, textarea, [contenteditable="true"]') !== null;
};

const eventMatches = (keyCode: string, event: Event): boolean => {
  const mouseButton = MOUSE_BUTTON_CODES[keyCode];
  return mouseButton === undefined
    ? event instanceof KeyboardEvent && event.code === keyCode
    : event instanceof MouseEvent && event.button === mouseButton;
};

const registerShortcut = (
  keyCode: string,
  subscription: ShortcutSubscription
): (() => void) => {
  let entry = shortcuts.get(keyCode);

  if (entry === undefined) {
    const eventType =
      MOUSE_BUTTON_CODES[keyCode] === undefined ? 'keydown' : 'mousedown';
    const subscriptions: ShortcutSubscription[] = [];
    const listener = (event: Event) => {
      if (isTypingTarget(event.target) || !eventMatches(keyCode, event)) return;

      // A shortcut can exist in multiple mounted views. The most recently
      // mounted view owns it until it unmounts, then the previous one resumes.
      subscriptions
        .at(-1)
        ?.callback.current(event as KeyboardEvent | MouseEvent);
      event.preventDefault();
    };

    entry = { eventType, listener, subscriptions };
    shortcuts.set(keyCode, entry);
    window.addEventListener(eventType, listener);
  }

  entry.subscriptions.push(subscription);

  return () => {
    const index = entry.subscriptions.indexOf(subscription);
    if (index !== -1) entry.subscriptions.splice(index, 1);

    if (entry.subscriptions.length === 0) {
      window.removeEventListener(entry.eventType, entry.listener);
      shortcuts.delete(keyCode);
    }
  };
};

const useShortcut = (keyCode: string, callback: ShortcutCallback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => registerShortcut(keyCode, { callback: callbackRef }),
    [keyCode]
  );
};

export default useShortcut;
