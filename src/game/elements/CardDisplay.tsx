import React from 'react';
import { useDispatch } from 'react-redux';
import Card from '../../features/Card';
import { clearPopUp, setPopUp } from '../../features/game/GameSlice';
import styles from './Card.module.css';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
}

export default function CardDisplay(prop: CardProp) {
  const { card } = prop;
  let { num } = prop;
  const classStyles: string[] = [styles.floatTint];
  const equipStatus: string[] = [styles.floatTint];
  const dispatch = useDispatch();

  if (card == null || card.cardNumber === '') {
    return null;
  }

  if (card.counters !== 0 && card.counters != undefined) {
    num = card.counters;
  }

  let eqImg = '';
  eqImg = `https://www.fleshandbloodonline.com/FaBOnline/concat/${card.cardNumber}.webp`;

  function onClick() {
    console.log('I have been clicked!');
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    dispatch(
      setPopUp({
        cardNumber: card.cardNumber,
        xCoord: e.clientX,
        yCoord: e.clientY
      })
    );
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };

  if (card.overlay === 'disabled') {
    classStyles.push(styles.disabled);
  }

  if (card.borderColor !== undefined) {
    // not implemented
    classStyles.push('border' + card.borderColor);
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

  return (
    <div
      className={styles.card}
      onClick={() => {
        onClick();
      }}
      onMouseEnter={(e) => handleMouseEnter(e)}
      onMouseLeave={() => handleMouseLeave()}
    >
      <img src={eqImg} className={styles.img} />

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
      </div>
    </div>
  );
}
