import React, { useRef } from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import Card from '../../../features/Card';
import {
  clearPopUp,
  playCard,
  setPopUp
} from '../../../features/game/GameSlice';
import styles from './CardDisplay.module.css';
import classNames from 'classnames';
import GemSlider from '../gemSlider/GemSlider';

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
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);

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
    [styles.border6]: card.borderColor == '6'
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
      <img src={eqImg} className={imgStyles} />
      <div className={classStyles}></div>
      <div className={equipStatus}></div>
      <div className={styles.floatCover}>
        {!!num && (
          <div className={styles.number}>
            <div className={styles.text}>{num}</div>
          </div>
        )}
        {!!Number(card.countersMap?.defence) && (
          <div className={styles.defCounter}>
            <div>{card.countersMap?.defence}</div>
          </div>
        )}
        {!!Number(card.countersMap?.life) && (
          <div className={styles.lifeCounter}>
            <div>{card.countersMap?.life}</div>
          </div>
        )}
        {card.label !== undefined && card.label !== '' && (
          <div className={styles.label}>{card.label}</div>
        )}
        {card.gem !== 'none' && (
          <GemSlider gem={card.gem} cardID={card.actionDataOverride} />
        )}
      </div>
    </div>
  );
}
