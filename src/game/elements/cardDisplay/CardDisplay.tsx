import React, { useRef } from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import { Card } from '../../../features/Card';
import {
  clearPopUp,
  playCard,
  setPopUp
} from '../../../features/game/GameSlice';
import styles from './CardDisplay.module.css';
import classNames from 'classnames';
import CountersOverlay from '../countersOverlay/CountersOverlay';
import CardImage from '../cardImage/CardImage';

export interface CardProp {
  makeMeBigger?: boolean;
  num?: number;
  name?: string;
  preventUseOnClick?: boolean;
  useCardMode?: number;
  card?: Card;
}

export const CardDisplay = (prop: CardProp) => {
  const { card, preventUseOnClick } = prop;
  const { num } = prop;
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

  if (card == null || card.cardNumber === '') {
    return null;
  }

  const eqImg = `./cardsquares/${card.cardNumber}.webp`;

  function onClick() {
    if (preventUseOnClick) {
      return;
    }
    if (card === undefined) {
      return;
    }
    dispatch(playCard({ cardParams: card }));
    handleMouseLeave();
  }

  const handleMouseEnter = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    dispatch(
      setPopUp({
        cardNumber: card.cardNumber,
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

  const classStyles = classNames(styles.floatTint, {
    [styles.disabled]: card.overlay === 'disabled'
  });

  const equipStatus = classNames(
    styles.floatTint,
    { [styles.isBroken]: card.isBroken },
    { [styles.onChain]: card.onChain },
    { [styles.isFrozen]: card.isFrozen }
  );

  const imgStyles = classNames(styles.img, {
    [styles.border1]: card.borderColor == '1',
    [styles.border2]: card.borderColor == '2',
    [styles.border3]: card.borderColor == '3',
    [styles.border4]: card.borderColor == '4',
    [styles.border5]: card.borderColor == '5',
    [styles.border6]: card.borderColor == '6',
    [styles.border7]: card.borderColor == '7'
  });

  const cardStyle = classNames(styles.card, styles.normalSize, {
    [styles.biggerSize]: prop.makeMeBigger
  });

  return (
    <div
      className={cardStyle}
      onClick={() => {
        onClick();
      }}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={ref}
    >
      <CardImage src={eqImg} className={imgStyles} />
      <div className={classStyles}></div>
      <div className={equipStatus}></div>
      <CountersOverlay {...card} num={num} />
    </div>
  );
};

export default CardDisplay;