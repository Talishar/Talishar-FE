import React, { useState, useEffect } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { getGameInfo } from 'features/game/GameSlice';
import CardImage from '../cardImage/CardImage';
import styles from './LastPlayed.module.css';
import CardPopUp from '../cardPopUp/CardPopUp';
import { CARD_SQUARES_PATH, CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';
import { Card } from 'features/Card';

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

function CardSlide({
  card,
  playerID,
  isStreamerMode,
  locale
}: {
  card: Card;
  playerID: number;
  isStreamerMode: boolean;
  locale: string;
}) {
  const cardNumber = card.cardNumber ?? 'CardBack';
  const hasMeld = MELD_CARDS.has(cardNumber);
  const imageSrc = getCollectionCardImagePath({
    path: isStreamerMode ? CARD_IMAGES_PATH : CARD_SQUARES_PATH,
    locale,
    cardNumber
  });
  const isOpponent =
    card.controller !== undefined && card.controller !== playerID;

  const imgClassNames = classNames(styles.img, {
    [styles.rotated]: hasMeld
  });

  return (
    <CardPopUp cardNumber={cardNumber} containerClass={styles.lastPlayed}>
      <CardImage
        src={imageSrc}
        className={imgClassNames}
        isOpponent={isOpponent}
      />
    </CardPopUp>
  );
}

export default function LastPlayed() {
  const recentlyPlayed = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.recentlyPlayed ?? []
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const playerCardBack = useAppSelector(
    (state: RootState) => state.game.playerOne.CardBack?.cardNumber
  ) ?? 'CardBack';
  const { getLanguage } = useLanguageSelector();
  const isStreamerMode =
    useSetting({ settingName: IS_STREAMER_MODE })?.value === '1';

  const [index, setIndex] = useState(0);

  // Reset index when a new card is played (list grows at front)
  useEffect(() => {
    setIndex(0);
  }, [recentlyPlayed.length]);

  if (recentlyPlayed.length === 0) {
    const placeholderSrc = getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale: getLanguage(),
      cardNumber: playerCardBack
    });
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Recently Played</span>
        </div>
        <div className={styles.viewport}>
          <div className={styles.track}>
            <div className={styles.slide}>
              <div className={styles.lastPlayed}>
                <CardImage src={placeholderSrc} className={styles.img} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canPrev = index > 0;
  const canNext = index < recentlyPlayed.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Recently Played</span>
        <div className={styles.arrows}>
          <button
            className={styles.arrowBtn}
            disabled={!canPrev}
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Previous card"
          >
            &#8592;
          </button>
          <button
            className={styles.arrowBtn}
            disabled={!canNext}
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Next card"
          >
            &#8594;
          </button>
        </div>
      </div>
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${index * 70}%)` }}
        >
          {recentlyPlayed.map((card, i) => (
            <div className={styles.slide} key={`${card.cardNumber}-${i}`}>
              <CardSlide
                card={card}
                playerID={gameInfo.playerID}
                isStreamerMode={isStreamerMode}
                locale={getLanguage()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
