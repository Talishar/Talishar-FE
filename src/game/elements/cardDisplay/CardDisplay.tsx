import React, { useRef } from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import Card from '../../../features/Card';
import {
  clearPopUp,
  playCard,
  setPopUp
} from '../../../features/game/GameSlice';
import styles from './CardDisplay.module.css';

export interface CardProp {
  card?: Card;
  makeMeBigger?: boolean;
  num?: number;
  name?: string;
  preventUseOnClick?: boolean;
  useCardMode?: number;
}

export default function CardDisplay(prop: CardProp) {
  const { card, preventUseOnClick } = prop;
  let { num } = prop;
  const classStyles: string[] = [styles.floatTint];
  const equipStatus: string[] = [styles.floatTint];
  const imgStyles: string[] = [styles.img];
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  let cardStyle = styles.card;

  if (card == null || card.cardNumber === '') {
    return null;
  }

  if (card.counters !== 0 && card.counters != undefined) {
    num = card.counters;
  }

  const eqImg = `./cardsquares/${card.cardNumber}.webp`;

  function onClick() {
    if (preventUseOnClick) {
      return;
    }
    if (card === undefined) {
      return;
    }
    console.log('clicked');
    dispatch(playCard({ cardParams: card }));
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

  if (card.overlay === 'disabled') {
    classStyles.push(styles.disabled);
  }

  if (card.borderColor !== undefined && card.borderColor !== '0') {
    // switch statement for different border colours
    imgStyles.push(styles.border6);
  }

  if (card.isBroken) {
    equipStatus.push(styles.isBroken);
  }

  if (card.onChain) {
    equipStatus.push(styles.onChain);
  }

  if (card.isFrozen) {
    equipStatus.push(styles.isFrozen);
  }

  cardStyle += prop.makeMeBigger
    ? ' ' + styles.biggerSize
    : ' ' + styles.normalSize;

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
      <img src={eqImg} className={imgStyles.join(' ')} />

      <div className={classStyles.join(' ')}></div>
      <div className={equipStatus.join(' ')}></div>
      <div className={styles.floatCover}>
        {num !== undefined && num !== 0 && (
          <div className={styles.number}>
            <div className={styles.text}>{num}</div>
          </div>
        )}
        {card.defCounters !== undefined && card.defCounters !== 0 && (
          <div className={styles.defCounter}>
            <div>{card.defCounters}</div>
          </div>
        )}
        {card.lifeCounters !== undefined && card.lifeCounters !== 0 && (
          <div className={styles.lifeCounter}>
            <div>{card.lifeCounters}</div>
          </div>
        )}
      </div>
    </div>
  );
}
