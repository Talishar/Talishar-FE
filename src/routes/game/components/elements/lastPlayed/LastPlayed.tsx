import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import CardImage from '../cardImage/CardImage';
import styles from './LastPlayed.module.css';
import CardPopUp from '../cardPopUp/CardPopUp';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';

export default function LastPlayed() {
  let cardRedux = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastPlayed
  );
  const { getLanguage } = useLanguageSelector();
  const hasNoLastPlayedCard = cardRedux == null;
  const cardNumber = cardRedux?.cardNumber ?? 'CardBack';
  const imageSrc = getCollectionCardImagePath({
    path: CARD_IMAGES_PATH,
    locale: getLanguage(),
    cardNumber
  });

  return (
    <CardPopUp
      isHidden={hasNoLastPlayedCard}
      cardNumber={cardNumber}
      containerClass={styles.lastPlayed}
    >
      <CardImage src={imageSrc} className={styles.img} />
    </CardPopUp>
  );
}
