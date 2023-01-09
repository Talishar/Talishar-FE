import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import { clearPopUp, setPopUp } from '../../../features/game/GameSlice';
import CardImage from '../cardImage/CardImage';
import styles from './LastPlayed.module.css';

export default function LastPlayed() {
  let cardRedux = useAppSelector(
    (state: RootState) => state.game.gameInfo.lastPlayed
  );

  const dispatch = useAppDispatch();

  if (cardRedux === undefined) {
    cardRedux = {
      cardNumber: 'CardBack'
    };
  } else {
    cardRedux = { cardNumber: cardRedux.cardNumber };
  }

  const handleMouseEnter = () => {
    if (cardRedux == undefined) {
      cardRedux = { cardNumber: 'CardBack' };
    }
    dispatch(setPopUp({ cardNumber: cardRedux.cardNumber }));
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };
  const src = `./cardimages/${cardRedux.cardNumber}.webp`;

  return (
    <div
      className={styles.lastPlayed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardImage src={src} className={styles.img} />
    </div>
  );
}
