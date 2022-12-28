import { useRef } from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import { clearPopUp, setPopUp } from '../../../features/game/GameSlice';
import styles from './CardTextLink.module.css';

export interface CardTextLinkProp {
  cardID: string;
  cardName: string;
}

export const CardTextLink = ({ cardID, cardName }: CardTextLinkProp) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    dispatch(
      setPopUp({
        cardNumber: cardID,
        xCoord: xCoord,
        yCoord: yCoord
      })
    );
  };

  const onTouchStart = () => {
    handleMouseEnter();
  };

  const onTouchEnd = () => {
    handleMouseLeave();
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };

  return (
    <span
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={ref}
    >
      {cardName}
    </span>
  );
};

export default CardTextLink;
