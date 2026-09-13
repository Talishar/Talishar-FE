import {
  clearCardPreview,
  getCardPreview,
  setCardPreview
} from '../cardPortal/cardPreviewStore';
import React, { ReactNode, useEffect, useId, useRef } from 'react';
import { CARD_BACK } from 'features/options/cardBacks';
import { useCardTilt } from './useCardTilt';
import { useCookieString } from 'utils/cookieStore';
import {
  TAP_TO_PREVIEW_PLAY_COOKIE,
  buildBoardCardSelectionKey,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey,
  isTapToPreviewPlayEnabled,
  resolveTapToPreviewPlay,
  setTapToPreviewSelectedCardKey,
  shouldDismissStickyPreviewOnOutsideTap,
  useIsTapToPreviewSelected
} from '../playerHandCard/tapToPreviewPlay';

const supportsHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LONG_PRESS_DELAY = 500;
const LONG_PRESS_MOVE_TOLERANCE = 12;

const SKIP_POPUP_CARDS = new Set<string>([
  ...Object.values(CARD_BACK),
  'STARTTURN',
  'CLOSESTEP',
  'ENDPHASE',
  'ENDTURN',
  'RESUMETURN',
  'PHANTASM',
  'SPECTRA',
  'MIRAGE',
  'FINALIZECHAINLINK',
  'DEFENDSTEP',
  'ATTACKSTEP',
  'RESOLUTIONSTEP',
  'CLOSINGCHAIN',
  'NONE00',
  'BLOODDEBT',
  'BEATCHEST',
  'MERIDIANWARD',
  'HIGHTIDE',
  'WATERYGRAVE',
  'DUMMYDISHONORED',
  'SHARPEN',
  'HEAVE',
  'INTIMIDATE',
  'DECAY'
]);

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  tiltEnabled: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onPenHover: () => void;
  onMouseLeave: () => void;
  onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchCancel: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

const CardSurface = ({
  children,
  className,
  containerRef,
  tiltEnabled,
  onHoverStart,
  onHoverEnd,
  onMouseEnter,
  onPenHover,
  onMouseLeave,
  onPointerDown,
  ...handlers
}: SurfaceProps) => {
  const { handleMouseMove, handleMouseLeave } = useCardTilt(
    containerRef,
    tiltEnabled
  );

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    onHoverStart?.();
    if (event.pointerType === 'pen') onPenHover();
  };
  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') onHoverEnd?.();
  };

  const onSurfaceMouseLeave = () => {
    if (tiltEnabled) handleMouseLeave();
    onMouseLeave();
  };

  return (
    <div
      className={className}
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseMove={tiltEnabled ? handleMouseMove : undefined}
      onMouseLeave={onSurfaceMouseLeave}
      onPointerDown={onPointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...handlers}
    >
      {children}
    </div>
  );
};

type CardPopUpProps = {
  children: ReactNode;
  cardNumber: string;
  containerClass?: string;
  onClick?: () => void;
  isHidden?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  isOpponent?: boolean;
  disableTilt?: boolean;
  disableTapToPreview?: boolean;
  previewYOffset?: number;
  /** Override sticky-selection key (hand cards pass a unique id-based key). */
  tapPreviewKey?: string;
};

export default function CardPopUp({
  children,
  cardNumber,
  containerClass,
  onClick,
  isHidden,
  onHoverStart,
  onHoverEnd,
  isOpponent,
  disableTilt,
  disableTapToPreview,
  previewYOffset = 0,
  tapPreviewKey
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const disableCardTilt = useCookieString('disableCardTilt');
  const tapToPreviewCookie = useCookieString(TAP_TO_PREVIEW_PLAY_COOKIE);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextClick = useRef(false);
  const lastPointerTypeRef = useRef<string | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const instanceId = useId();

  const selectionKey =
    tapPreviewKey ??
    buildBoardCardSelectionKey({
      cardNumber,
      isOpponent,
      instanceId
    });

  const cookieEnabled = isTapToPreviewPlayEnabled(tapToPreviewCookie);

  const isTapToPreviewContext = () =>
    !disableTapToPreview &&
    cookieEnabled &&
    (lastPointerTypeRef.current === 'touch' || !supportsHover);

  const isSelected = useIsTapToPreviewSelected(selectionKey);
  const stickyActive = cookieEnabled && isSelected;

  const tiltEnabled =
    supportsHover &&
    !prefersReducedMotion &&
    !disableTilt &&
    disableCardTilt !== 'true';

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!stickyActive) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      // Only the sticky card itself is exempt; any other tap dismisses.
      // Another card's own click then re-selects / switches preview.
      if (ref.current?.contains(target)) return;
      if (
        !shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: getTapToPreviewSelectedCardKey()
        })
      ) {
        return;
      }
      clearTapToPreviewSelection();
      clearCardPreview();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [stickyActive]);

  const showPreview = (
    presentation: 'floating' | 'mobile-modal' = 'floating'
  ) => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    if (isHidden === true || SKIP_POPUP_CARDS.has(cardNumber)) {
      return;
    }
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const anchorY = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    const yCoord = Math.min(window.innerHeight, anchorY + previewYOffset);
    setCardPreview({
      cardNumber,
      xCoord,
      yCoord,
      isOpponent,
      presentation
    });
  };

  const showHoverPreview = (pointerKind: 'mouse' | 'pen') => {
    // A stylus hovers on devices whose primary input reports no hover at all,
    // so trust the pen event over the media query.
    if (pointerKind !== 'pen' && !supportsHover) return;
    // A touch emits synthetic mouse events after touchend. Surfaces that opted
    // out of tap-to-preview must not get a preview from that replayed hover.
    if (disableTapToPreview && lastPointerTypeRef.current === 'touch') return;
    showPreview();
  };

  const handleMouseEnter = () => showHoverPreview('mouse');
  const handlePenHover = () => showHoverPreview('pen');

  const clearPopUpUnlessSticky = () => {
    if (getCardPreview().presentation === 'mobile-modal') {
      return;
    }
    if (getTapToPreviewSelectedCardKey() === selectionKey) {
      return;
    }
    clearCardPreview();
  };

  const handleMouseLeave = () => {
    clearPopUpUnlessSticky();
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    cancelLongPress();
    suppressNextClick.current = false;
    lastPointerTypeRef.current = 'touch';
    const touch = event.touches[0];
    touchOrigin.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      showPreview('mobile-modal');
      suppressNextClick.current = true;
    }, LONG_PRESS_DELAY);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    cancelLongPress();
    touchOrigin.current = null;
    if (suppressNextClick.current) {
      // The hold already opened the preview, so stop the browser from
      // replaying this touch as a tap on whatever is under the finger.
      event.preventDefault();
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!longPressTimer.current) return;
    const origin = touchOrigin.current;
    const touch = event.touches[0];
    if (!origin || !touch) {
      cancelLongPress();
      return;
    }
    // Only a real drag cancels the hold; finger jitter during a press does not.
    const distance = Math.hypot(
      touch.clientX - origin.x,
      touch.clientY - origin.y
    );
    if (distance > LONG_PRESS_MOVE_TOLERANCE) cancelLongPress();
  };

  const handleTouchCancel = () => {
    cancelLongPress();
    touchOrigin.current = null;
  };

  const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      // A hold must not also activate the card: the surrounding label or zone
      // would otherwise still toggle on the click that follows the press.
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (isTapToPreviewContext()) {
      // Do not stopPropagation: zone wrappers (pitch/graveyard/banish/deck)
      // and modal parents (e.g. OtherInput) must still receive the click.
      if (isHidden === true || SKIP_POPUP_CARDS.has(cardNumber)) {
        onClick?.();
        return;
      }
      const { action, nextSelectedKey } = resolveTapToPreviewPlay({
        enabled: true,
        cardKey: selectionKey
      });
      setTapToPreviewSelectedCardKey(nextSelectedKey);
      if (action === 'preview') {
        showPreview();
        return;
      }
      onClick?.();
      clearCardPreview();
      return;
    }

    onClick?.();
    handleMouseLeave();
  };

  return (
    <CardSurface
      className={containerClass}
      containerRef={ref}
      tiltEnabled={tiltEnabled}
      onClick={handleOnClick}
      onPointerDown={(event) => {
        lastPointerTypeRef.current = event.pointerType;
        if (event.pointerType !== 'touch') suppressNextClick.current = false;
      }}
      onMouseEnter={handleMouseEnter}
      onPenHover={handlePenHover}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </CardSurface>
  );
}
