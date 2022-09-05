import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { clearPopUp, setPopUp } from '../../features/game/GameSlice';
import styles from './LastPlayed.module.css';

export default function LastPlayed() {
  let cardRedux = useSelector(
    (state: RootState) => state.game.gameInfo.lastPlayed
  );
  const dispatch = useDispatch();

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
  const src = `https://www.fleshandbloodonline.com/FaBOnline2/WebpImages/${cardRedux.cardNumber}.webp`;

  return (
    <div
      className={styles.lastPlayed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img src={src} className={styles.img} />
    </div>
  );
}
