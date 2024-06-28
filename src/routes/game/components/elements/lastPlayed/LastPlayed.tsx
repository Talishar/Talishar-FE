import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import CardImage from '../cardImage/CardImage';
import styles from './LastPlayed.module.css';
import CardPopUp from '../cardPopUp/CardPopUp';
import { getCardImagesImagePath } from 'utils';

export default function LastPlayed() {
  let cardRedux = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastPlayed
  );
  const hasNoLastPlayedCard = cardRedux == null;
  const cardNumber = cardRedux?.cardNumber ?? 'CardBack';
  const src = getCardImagesImagePath({ locale: 'es', cardNumber });
  // const src = `/cardimages/${cardNumber}.webp`;

  return (
    <CardPopUp
      isHidden={hasNoLastPlayedCard}
      cardNumber={cardNumber}
      containerClass={styles.lastPlayed}
    >
      <CardImage src={src} className={styles.img} />
    </CardPopUp>
  );
}
