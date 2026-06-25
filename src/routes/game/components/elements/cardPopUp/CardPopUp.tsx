import { useAppDispatch } from 'app/Hooks';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
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
  const [windowWidth, windowHeight] = useWindowDimensions();
  const [cookies] = useCookies(['disableCardTilt']);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchPopupShown = useRef(false);

  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING_CONFIG);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING_CONFIG);
  const boxShadow = useTransform(
    [rotateX, rotateY],
    ([rx, ry]: number[]) => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!supportsHover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateXTarget.set(-((e.clientY - cy) / (rect.height / 2)) * 8);
    rotateYTarget.set(((e.clientX - cx) / (rect.width / 2)) * 8);
  };

  const handleMouseEnter = () => {
    if (ref.current === null || isHidden === true || SKIP_POPUP_CARDS.has(cardNumber)) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const xCoord = rect.left < windowWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < windowHeight / 2 ? rect.bottom : rect.top;
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
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      ref={ref}
      style={supportsHover && !disableTilt && cookies.disableCardTilt !== 'true' ? { rotateX, rotateY, transformPerspective: 600, boxShadow } : undefined}
    >
      {children}
    </motion.div>
  );
}
