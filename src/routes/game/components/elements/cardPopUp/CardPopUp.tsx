import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardImage from '../cardImage/CardImage';
import styles from './CardPopUp.module.css';
import { doubleFacedCardsMappings } from './constants';
import classNames from 'classnames';

const popUpGap = 10;

function CardPopUp({ src, containerClass, containerStyle }: { src: string, containerClass?: string, containerStyle?: Record<string, string> }) {
  const containerClassName = containerClass != null ? containerClass : classNames(styles.defaultPos, styles.popUp);
  return (
    <div className={containerClassName} style={containerStyle}>
        <div className={styles.popUpInside} key={src}>
        <CardImage src={src} className={styles.img} />
      </div>
    </div>);
}

function getSrcs(cardNumber: string): Array<string> {
  const cardNumbers = [cardNumber];
  if (doubleFacedCardsMappings[cardNumber] != null) {
    cardNumbers.push(doubleFacedCardsMappings[cardNumber]);
  }
  return cardNumbers.map((currentCardNumber) => 
    `/cardimages/${currentCardNumber}.webp`
  );
}

export default function CardPopUpContainer() {
  const popup = useAppSelector((state: RootState) => state.game.popup);

  if (
    popup === undefined ||
    popup.popupOn === false ||
    popup.popupCard === undefined
  ) {
    return null;
  }

  const [src, dfcSrc] = getSrcs(popup.popupCard.cardNumber);

  if (popup.xCoord === undefined || popup.yCoord === undefined) {
    return (<CardPopUp src={src} />);
  }

  const popUpStyle: Record<string, string> = {}

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
      {dfcSrc != null && <CardPopUp src={dfcSrc} containerClass={classNames(styles.popUp, styles.doubleFacedCard)} />}
      <CardPopUp src={src} containerClass={styles.popUp} containerStyle={popUpStyle} />
    </div>
   )
}
