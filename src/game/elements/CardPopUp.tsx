import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import styles from './CardPopUp.module.css';

export default function CardPopUp() {
  const popup = useSelector((state: RootState) => state.game.popup);
  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  let classStyle = popup.onRight ? styles.onRight : styles.onLeft;
  classStyle += ' ' + styles.popUp;
  const src = `https://www.fleshandbloodonline.com/FaBOnline/WebpImages/${popup.popupCard.cardNumber}.webp`;

  return (
    <div className={classStyle}>
      <div className={styles.popUpInside}>
        <img src={src} className={styles.img} />
      </div>
    </div>
  );
}
