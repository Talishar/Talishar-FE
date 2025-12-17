import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearPopUp, setPopUp } from 'features/game/GameSlice';
import CardImage from '../cardImage/CardImage';
import styles from './LastPlayed.module.css';
import CardPopUp from '../cardPopUp/CardPopUp';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import classNames from 'classnames';

// Cards with Meld mechanics that need to be rotated
const MELD_CARDS = new Set([
  'arcane_seeds__life_red',
  'burn_up__shock_red',
  'comet_storm__shock_red',
  'consign_to_cosmos__shock_yellow',
  'everbloom__life_blue',
  'null__shock_yellow',
  'pulsing_aether__life_red',
  'rampant_growth__life_yellow',
  'regrowth__shock_blue',
  'thistle_bloom__life_yellow',
  'vaporize__shock_yellow'
]);

export default function LastPlayed() {
  let cardRedux = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastPlayed
  );
  const { getLanguage } = useLanguageSelector();
  const hasNoLastPlayedCard = cardRedux == null;
  const cardNumber = cardRedux?.cardNumber ?? 'CardBack';
  const hasMeld = MELD_CARDS.has(cardNumber);
  const imageSrc = getCollectionCardImagePath({
    path: CARD_IMAGES_PATH,
    locale: getLanguage(),
    cardNumber
  });

  const imgClassNames = classNames(styles.img, {
    [styles.rotated]: hasMeld
  });

  return (
    <CardPopUp
      isHidden={hasNoLastPlayedCard}
      cardNumber={cardNumber}
      containerClass={styles.lastPlayed}
    >
      <CardImage src={imageSrc} className={imgClassNames} />
    </CardPopUp>
  );
}
