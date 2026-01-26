import { useAppDispatch } from 'app/Hooks';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { ReactNode, useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_BACK } from 'features/options/cardBacks';

type CardPopUpProps = {
  children: ReactNode;
  cardNumber: string;
  containerClass?: string;
  onClick?: () => void;
  isHidden?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  isOpponent?: boolean;
};

export default function CardPopUp({
  children,
  cardNumber,
  containerClass,
  onClick,
  isHidden,
  onHoverStart,
  onHoverEnd,
  isOpponent
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [windowWidth, windowHeight] = useWindowDimensions();

  const handleMouseEnter = () => {
    const cardBackValues = Object.values(CARD_BACK);
    
    if (
      ref.current === null ||
      isHidden === true ||
      cardBackValues.includes(cardNumber) ||
      cardNumber === 'ENDPHASE' ||
      cardNumber === 'ENDTURN' ||
      cardNumber === 'RESUMETURN' ||
      cardNumber === 'PHANTASM' ||
      cardNumber === 'SPECTRA' ||
      cardNumber === 'MIRAGE' ||
      cardNumber === 'FINALIZECHAINLINK' ||
      cardNumber === 'DEFENDSTEP' ||
      cardNumber == 'ATTACKSTEP' ||
      cardNumber == 'RESOLUTIONSTEP' ||
      cardNumber == 'CLOSINGCHAIN' ||
      cardNumber == 'NONE00' ||
      cardNumber == 'BLOODDEBT' ||
      cardNumber == 'BEATCHEST' ||
      cardNumber == 'MERIDIANWARD' ||
      cardNumber == 'HIGHTIDE' ||
      cardNumber == "WATERYGRAVE" || 
      cardNumber == "DUMMYDISHONORED" ||
      cardNumber == "HEAVE" ||
      cardNumber == "STARTTURN"
    ) {
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
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      ref={ref}
    >
      {children}
    </motion.div>
  );
}
