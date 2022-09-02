import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import styles from './CardPopUp.module.css';

const popUpGap = 10;

export default function CardPopUp() {
  const popup = useSelector((state: RootState) => state.game.popup);
  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const src = `https://www.fleshandbloodonline.com/FaBOnline/WebpImages/${popup.popupCard.cardNumber}.webp`;

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return (
      <div className={styles.defaultPos + ' ' + styles.popUp}>
        <div className={styles.popUpInside}>
          <img src={src} className={styles.img} />
        </div>
      </div>
    );
  }

  const popUpStyle: Record<string, string> = {};

  if (popup.xCoord > window.innerWidth / 2) {
    popUpStyle.right =
      (window.innerWidth - (popup.xCoord - popUpGap)).toString() + 'px';
  } else {
    popUpStyle.left = (popup.xCoord + popUpGap).toString() + 'px';
  }

  if (popup.yCoord < window.innerHeight / 2) {
    popUpStyle.top = popup.yCoord.toString() + 'px';
  } else {
    popUpStyle.bottom =
      (window.innerHeight - popup.yCoord + popUpGap).toString() + 'px';
  }

  return (
    <div className={styles.popUp} style={popUpStyle}>
      <div className={styles.popUpInside}>
        <img src={src} className={styles.img} />
      </div>
    </div>
  );
}
