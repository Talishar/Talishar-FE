import { useAppDispatch } from 'app/Hooks';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { ReactNode, useRef } from 'react';
import { motion } from 'framer-motion';

type CardPopUpProps = {
  children: ReactNode;
  cardNumber: string;
  containerClass?: string;
  onClick?: () => void;
  isHidden?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

export default function CardPopUp({
  children,
  cardNumber,
  containerClass,
  onClick,
  isHidden,
  onHoverStart,
  onHoverEnd
}: CardPopUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [windowWidth, windowHeight] = useWindowDimensions();

  const handleMouseEnter = () => {
    if (
      ref.current === null ||
      isHidden === true ||
      cardNumber === 'ENDPHASE' ||
      cardNumber === 'ENDTURN' ||
      cardNumber === 'RESUMETURN' ||
      cardNumber === 'PHANTASM' ||
      cardNumber === 'MIRAGE' ||
      cardNumber === 'FINALIZECHAINLINK' ||
      cardNumber === 'DEFENDSTEP' ||
      cardNumber == 'ATTACKSTEP' ||
      cardNumber == 'RESOLUTIONSTEP' ||
      cardNumber == 'CLOSINGCHAIN' ||
      cardNumber == 'CardBack' ||
      cardNumber == 'NONE00' ||
      cardNumber == 'BLOODDEBT' ||
      cardNumber == 'BEATCHEST' ||
      cardNumber == 'MERIDIANWARD' ||
      cardNumber == 'HIGHTIDE'
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
        yCoord
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
