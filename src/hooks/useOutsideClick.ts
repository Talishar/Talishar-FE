import { RefObject, useEffect, useRef } from 'react';

type ElementRef = RefObject<HTMLElement | null>;

interface UseOutsideClickOptions {
  enabled?: boolean;
  isInside?: (target: Node) => boolean;
}

export const useOutsideClick = (
  refs: ElementRef | ElementRef[],
  onOutsideClick: () => void,
  { enabled = true, isInside }: UseOutsideClickOptions = {}
) => {
  const callbackRef = useRef(onOutsideClick);
  callbackRef.current = onOutsideClick;

  const insideRef = useRef(isInside);
  insideRef.current = isInside;

  const refList = Array.isArray(refs) ? refs : [refs];
  const refsRef = useRef(refList);
  refsRef.current = refList;

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const elements = refsRef.current
        .map((ref) => ref.current)
        .filter((element): element is HTMLElement => !!element);
      if (elements.length === 0) return;
      if (elements.some((element) => element.contains(target))) return;
      if (insideRef.current?.(target)) return;
      callbackRef.current();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [enabled]);
};

export default useOutsideClick;
