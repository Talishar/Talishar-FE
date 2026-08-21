import { useAppDispatch } from 'app/Hooks';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import React, { ReactNode, useEffect, useId, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CARD_BACK } from 'features/options/cardBacks';
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
  'INTIMIDATE'
]);

const TILT_SPRING_CONFIG = { stiffness: 180, damping: 22, mass: 0.6 };

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  disableShadow?: boolean;
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

const StaticSurface = ({
  children,
  className,
  containerRef,
  disableShadow: _disableShadow,
  onHoverStart,
  onHoverEnd,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
  ...handlers
}: SurfaceProps) => {
  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') onHoverStart?.();
  };
  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') onHoverEnd?.();
  };

  return (
    <div
      className={className}
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...handlers}
    >
      {children}
    </div>
  );
};

const TiltSurface = ({
  children,
  className,
  containerRef,
  disableShadow,
  onMouseLeave,
  ...handlers
}: SurfaceProps) => {
  // Owned here rather than shared with CardPopUp, so nothing mutates a prop.
  const hoverRect = useRef<DOMRect | null>(null);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING_CONFIG);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING_CONFIG);

  const boxShadow = useTransform([rotateX, rotateY], ([rx, ry]: number[]) => {
    if (disableShadow) return 'none';
    const offsetX = Math.round(-ry * 1.2);
    const offsetY = Math.round(rx * 1.2 + 8);
    const blur = Math.round(18 + Math.abs(rx) * 0.7 + Math.abs(ry) * 0.7);
    return `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,0.52)`;
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = containerRef.current;
    if (!element) return;
    let rect = hoverRect.current;
    if (!rect) {
      rect = element.getBoundingClientRect();
      hoverRect.current = rect;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateXTarget.set(-((event.clientY - cy) / (rect.height / 2)) * 8);
    rotateYTarget.set(((event.clientX - cx) / (rect.width / 2)) * 8);
  };

  const handleMouseLeave = () => {
    hoverRect.current = null;
    onMouseLeave();
    rotateXTarget.set(0);
    rotateYTarget.set(0);
  };

  return (
    <motion.div
      className={className}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 600,
        boxShadow
      }}
      {...handlers}
    >
      {children}
    </motion.div>
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
  disableShadow?: boolean;
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
  disableShadow,
  tapPreviewKey
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
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
    supportsHover && !disableTilt && disableCardTilt !== 'true';

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
      dispatch(clearPopUp());
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [stickyActive, dispatch]);

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
    dispatch(
      setPopUp({
        cardNumber,
        xCoord,
        yCoord,
        isOpponent
      })
    );
  };

  const handleMouseEnter = () => {
    showPreview();
  };

  const clearPopUpUnlessSticky = () => {
    if (getTapToPreviewSelectedCardKey() === selectionKey) {
      return;
    }
    dispatch(clearPopUp());
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
      dispatch(clearPopUp());
      return;
    }

    onClick?.();
    handleMouseLeave();
  };

  const Surface = tiltEnabled ? TiltSurface : StaticSurface;

  return (
    <Surface
      className={containerClass}
      containerRef={ref}
      disableShadow={disableShadow}
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
    </Surface>
  );
}
