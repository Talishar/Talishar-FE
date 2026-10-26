import { useSyncExternalStore } from 'react';
import { useMediaQuery } from './useMediaQuery';

const MOUSE_SEEN_KEY = 'mouseInputSeen';
const MOUSE_INPUT_CLASS = 'mouseInput';
const FINE_POINTER_QUERY = '(pointer: fine)';
const POINTER_EVENTS = ['pointerover', 'pointermove', 'pointerdown'] as const;

const listeners = new Set<() => void>();

const readMouseSeen = () => {
  try {
    return localStorage.getItem(MOUSE_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

const persistMouseSeen = () => {
  try {
    localStorage.setItem(MOUSE_SEEN_KEY, 'true');
  } catch {
    return;
  }
};

let mouseSeen = typeof window !== 'undefined' && readMouseSeen();

const syncMouseInputClass = () =>
  document.documentElement.classList.toggle(
    MOUSE_INPUT_CLASS,
    mouseSeen || window.matchMedia(FINE_POINTER_QUERY).matches
  );

const onPointer = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') return;
  POINTER_EVENTS.forEach((type) =>
    window.removeEventListener(type, onPointer, true)
  );
  mouseSeen = true;
  persistMouseSeen();
  syncMouseInputClass();
  listeners.forEach((listener) => listener());
};

export const installMouseInput = () => {
  syncMouseInputClass();
  window
    .matchMedia(FINE_POINTER_QUERY)
    .addEventListener('change', syncMouseInputClass);
  if (mouseSeen) return;
  POINTER_EVENTS.forEach((type) =>
    window.addEventListener(type, onPointer, { capture: true, passive: true })
  );
};

export const hasSeenMouse = () => mouseSeen;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useMouseSeen() {
  return useSyncExternalStore(subscribe, hasSeenMouse, () => false);
}

export function useHasMouse() {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  return useMouseSeen() || finePointer;
}
