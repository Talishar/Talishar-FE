import {
  clearCardPreview,
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

const LONG_PRESS_DELAY = 400;

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
  onClick: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
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
  onMouseLeave,
  onPointerDown,
  ...handlers
}: SurfaceProps) => {
  const { handleMouseMove, handleMouseLeave } = useCardTilt(
    containerRef,
    tiltEnabled
  );

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') onHoverStart?.();
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
  tapPreviewKey
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const disableCardTilt = useCookieString('disableCardTilt');
  const tapToPreviewCookie = useCookieString(TAP_TO_PREVIEW_PLAY_COOKIE);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchPopupShown = useRef(false);
  const lastPointerTypeRef = useRef<string | null>(null);
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
    cookieEnabled && (lastPointerTypeRef.current === 'touch' || !supportsHover);

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

  const showPreview = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    if (isHidden === true || SKIP_POPUP_CARDS.has(cardNumber)) {
      return;
    }
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    setCardPreview({ cardNumber, xCoord, yCoord, isOpponent });
  };

  const handleMouseEnter = () => {
    showPreview();
  };

  const clearPopUpUnlessSticky = () => {
    if (getTapToPreviewSelectedCardKey() === selectionKey) {
      return;
    }
    clearCardPreview();
  };

  const handleMouseLeave = () => {
    clearPopUpUnlessSticky();
  };

  const handleTouchStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    touchPopupShown.current = false;
    lastPointerTypeRef.current = 'touch';
    if (cookieEnabled) return;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      handleMouseEnter();
      touchPopupShown.current = true;
    }, LONG_PRESS_DELAY);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (touchPopupShown.current) {
      handleMouseLeave();
      touchPopupShown.current = false;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOnClick = () => {
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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </CardSurface>
  );
}
