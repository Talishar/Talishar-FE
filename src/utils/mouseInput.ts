import { patchMediaQueries } from './patchMediaQueries';

const MOUSE_SEEN_KEY = 'mouseInputSeen';

const readMouseSeen = () => {
  try {
    return localStorage.getItem(MOUSE_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const mouseSeen = readMouseSeen();

const rememberMouse = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') return;
  window.removeEventListener('pointermove', rememberMouse);
  try {
    localStorage.setItem(MOUSE_SEEN_KEY, 'true');
  } catch {
    return;
  }
};

export const installMouseInput = () => {
  if (!mouseSeen) {
    window.addEventListener('pointermove', rememberMouse, { passive: true });
    return;
  }
  patchMediaQueries((mediaText) =>
    mediaText
      .replace(/\((pointer: fine|hover: hover)\)/g, '(min-width: 0px)')
      .replace(
        /\(pointer: coarse\)(?! and \(max-width: 1199px\))/g,
        '$& and (max-width: 1199px)'
      )
  );
};
