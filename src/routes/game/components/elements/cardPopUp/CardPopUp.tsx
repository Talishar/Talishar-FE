import { useAppDispatch } from 'app/Hooks';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import { ReactNode, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCookies } from 'react-cookie';
import { CARD_BACK } from 'features/options/cardBacks';

const supportsHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const LONG_PRESS_DELAY = 400;

const SKIP_POPUP_CARDS = new Set<string>([
  ...Object.values(CARD_BACK),
  'STARTTURN', 'CLOSESTEP', 'ENDPHASE', 'ENDTURN', 'RESUMETURN',
  'PHANTASM', 'SPECTRA', 'MIRAGE', 'FINALIZECHAINLINK', 'DEFENDSTEP',
  'ATTACKSTEP', 'RESOLUTIONSTEP', 'CLOSINGCHAIN', 'NONE00', 'BLOODDEBT',
  'BEATCHEST', 'MERIDIANWARD', 'HIGHTIDE', 'WATERYGRAVE', 'DUMMYDISHONORED',
  'SHARPEN', 'HEAVE', 'INTIMIDATE',
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
  disableTilt
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [cookies] = useCookies(['disableCardTilt']);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchPopupShown = useRef(false);
  const hoverRect = useRef<DOMRect | null>(null);

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

  const handleMouseEnter = () => {
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

  const handleMouseLeave = () => {
    hoverRect.current = null;
    dispatch(clearPopUp());
    rotateXTarget.set(0);
    rotateYTarget.set(0);
  };

  const handleTouchStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    touchPopupShown.current = false;
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
      dispatch(clearPopUp());
      rotateXTarget.set(0);
      rotateYTarget.set(0);
      touchPopupShown.current = false;
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if finger moves (user is scrolling)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOnClick = () => {
    if (onClick != null) {
      onClick();
    }
    handleMouseLeave();
  };

  return (
    <motion.div
      className={containerClass}
      onClick={handleOnClick}
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
          ? { rotateX, rotateY, transformPerspective: 600, boxShadow }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
