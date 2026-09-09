import { useEffect } from 'react';

const NO_CALLOUT_CLASS = 'noImageCallout';

let lastPointerType: string | null = null;
let activeCount = 0;

const rememberPointerType = (event: PointerEvent) => {
  lastPointerType = event.pointerType;
};

const suppressImageContextMenu = (event: MouseEvent) => {
  const pointerType = (event as PointerEvent).pointerType || lastPointerType;
  if (pointerType === 'mouse') return;

  const target = event.target as Element | null;
  if (target?.closest('img, picture, a[href], [data-suppress-touch-menu]')) {
    event.preventDefault();
  }
};

export default function useSuppressTouchImageMenu() {
  useEffect(() => {
    activeCount += 1;
    if (activeCount === 1) {
      document.addEventListener('pointerdown', rememberPointerType, true);
      document.addEventListener('contextmenu', suppressImageContextMenu, true);
      document.body.classList.add(NO_CALLOUT_CLASS);
    }

    return () => {
      activeCount -= 1;
      if (activeCount === 0) {
        document.removeEventListener('pointerdown', rememberPointerType, true);
        document.removeEventListener(
          'contextmenu',
          suppressImageContextMenu,
          true
        );
        document.body.classList.remove(NO_CALLOUT_CLASS);
      }
    };
  }, []);
}
