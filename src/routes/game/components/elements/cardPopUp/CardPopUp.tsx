import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import { ReactNode, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCookies } from 'react-cookie';
import { CARD_BACK } from 'features/options/cardBacks';
import {
  TAP_PREVIEW_CARD_SELECTOR,
  TAP_TO_PREVIEW_PLAY_COOKIE,
  buildBoardCardSelectionKey,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey,
  isTapToPreviewPlayEnabled,
  resolveTapToPreviewPlay,
  setTapToPreviewSelectedCardKey,
  shouldDismissStickyPreviewOnOutsideTap
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
  const [cookies] = useCookies(['disableCardTilt', TAP_TO_PREVIEW_PLAY_COOKIE]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchPopupShown = useRef(false);
  const hoverRect = useRef<DOMRect | null>(null);
  const lastPointerTypeRef = useRef<string | null>(null);
  const popupCardNumber = useAppSelector(
    (state: RootState) => state.game.popup?.popupCard?.cardNumber
  );

  const selectionKey =
    tapPreviewKey ??
    buildBoardCardSelectionKey({
      cardNumber,
      isOpponent
    });

  const cookieEnabled = isTapToPreviewPlayEnabled(
    cookies[TAP_TO_PREVIEW_PLAY_COOKIE]
  );

  const isTapToPreviewContext = () =>
    cookieEnabled &&
    (lastPointerTypeRef.current === 'touch' || !supportsHover);

  const stickyActive =
    cookieEnabled && getTapToPreviewSelectedCardKey() === selectionKey;

  const tiltEnabled =
    supportsHover && !disableTilt && cookies.disableCardTilt !== 'true';

  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING_CONFIG);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING_CONFIG);
  // Gates the tilt/shadow to a hard "off" state. Kept as its own motion value
  // (rather than branching the style object between a spring and a static
  // literal) because Framer Motion animates a style key's value across
  // renders even when it switches from a MotionValue to a plain number, so a
  // ternary style object would still visibly decay instead of snapping off.
  const intensity = useMotionValue(1);
  const boxShadow = useTransform(
    [rotateX, rotateY, intensity],
    ([rx, ry, i]: number[]) => {
      if (i === 0) return 'none';
      const offsetX = -ry * 1.2;
      const offsetY = rx * 1.2 + 8;
      const blur = 18 + Math.abs(rx) * 0.7 + Math.abs(ry) * 0.7;
      return `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,0.52)`;
    }
  );

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (disableTilt) {
      hoverRect.current = null;
      rotateXTarget.jump(0);
      rotateYTarget.jump(0);
      rotateX.jump(0);
      rotateY.jump(0);
      intensity.jump(0);
    } else {
      intensity.jump(1);
    }
  }, [disableTilt, rotateXTarget, rotateYTarget, rotateX, rotateY, intensity]);

  useEffect(() => {
    if (!stickyActive) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (ref.current?.contains(target)) return;
      const isTapOnPreviewableCard = Boolean(
        target?.closest?.(TAP_PREVIEW_CARD_SELECTOR)
      );
      if (
        !shouldDismissStickyPreviewOnOutsideTap({
          enabled: true,
          selectedKey: getTapToPreviewSelectedCardKey(),
          isTapOnPreviewableCard
        })
      ) {
        return;
      }
      clearTapToPreviewSelection();
      dispatch(clearPopUp());
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [stickyActive, dispatch, popupCardNumber]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !ref.current) return;
    let rect = hoverRect.current;
    if (!rect) {
      rect = ref.current.getBoundingClientRect();
      hoverRect.current = rect;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateXTarget.set(-((e.clientY - cy) / (rect.height / 2)) * 8);
    rotateYTarget.set(((e.clientX - cx) / (rect.width / 2)) * 8);
  };

  const showPreview = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    hoverRect.current = rect;
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
    hoverRect.current = null;
    clearPopUpUnlessSticky();
    rotateXTarget.set(0);
    rotateYTarget.set(0);
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
      hoverRect.current = null;
      clearPopUpUnlessSticky();
      rotateXTarget.set(0);
      rotateYTarget.set(0);
      touchPopupShown.current = false;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOnClick = (event: React.MouseEvent) => {
    if (isTapToPreviewContext()) {
      event.stopPropagation();
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
      clearTapToPreviewSelection();
      onClick?.();
      dispatch(clearPopUp());
      return;
    }

    onClick?.();
    handleMouseLeave();
  };

  return (
    <motion.div
      className={containerClass}
      data-tap-preview-card={cookieEnabled ? 'true' : undefined}
      onClick={handleOnClick}
      onPointerDown={(event) => {
        lastPointerTypeRef.current = event.pointerType;
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={tiltEnabled ? handleMouseMove : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      ref={ref}
      style={
        tiltEnabled
          ? {
              rotateX,
              rotateY,
              transformPerspective: 600,
              boxShadow: disableShadow ? 'none' : boxShadow
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
