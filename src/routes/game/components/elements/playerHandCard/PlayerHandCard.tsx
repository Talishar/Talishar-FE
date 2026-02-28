import { useRef, useState, useEffect } from 'react';
import {
  clearPopUp,
  playCard,
  removeCardFromHand
} from 'features/game/GameSlice';
import {
  GiTombstone,
  GiFluffySwirl,
  GiCannon,
  GiDialPadlock
} from 'react-icons/gi';
import { Card } from 'features/Card';
import styles from './PlayerHandCard.module.css';
import { useAppDispatch } from 'app/Hooks';
import { LONG_PRESS_TIMER } from 'appConstants';
import classNames from 'classnames';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { motion, PanInfo } from 'framer-motion';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';

const ScreenPercentageForCardPlayed = 0.25;

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  zIndex?: number;
  addCardToPlayedCards: (cardName: string) => void;
  isNewlyDrawn?: boolean;
}

export const PlayerHandCard = ({
  card,
  isArsenal,
  isBanished,
  isGraveyard,
  zIndex,
  addCardToPlayedCards,
  isNewlyDrawn
}: HandCard) => {
  const [canPopUp, setCanPopup] = useState(true);
  const [, windowHeight] = useWindowDimensions();
  const [snapback, setSnapback] = useState<boolean>(true);
  const { getLanguage } = useLanguageSelector();

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();
  const hasDispatchedClearRef = useRef<boolean>(false);

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }

  const src = getCollectionCardImagePath({
    path: CARD_SQUARES_PATH,
    locale: getLanguage(),
    cardNumber: card.cardNumber
  });
  const dispatch = useAppDispatch();

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Only play card on drag if vertical movement is significant (prevent accidental plays on scroll)
    const isMobile = windowHeight > 800;
    const dragThreshold = isMobile 
      ? windowHeight * ScreenPercentageForCardPlayed * 1.5 // Higher threshold on mobile
      : windowHeight * ScreenPercentageForCardPlayed;
    
    if (Math.abs(info.offset.y) > dragThreshold) {
      setSnapback(false);
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
    }
    setCanPopup(true);
    hasDispatchedClearRef.current = false;
  };

  const playCardFunc = () => {
    dispatch(playCard({ cardParams: card }));
    dispatch(clearPopUp());
    if (!isBanished && !isGraveyard && !isArsenal) {
      dispatch(removeCardFromHand({ card }));
    }
  };

  const onDrag = () => {
    if (canPopUp && !hasDispatchedClearRef.current) {
      setSnapback(true);
      if (!isLongPress.current) {
        dispatch(clearPopUp());
        hasDispatchedClearRef.current = true;
        setCanPopup(false);
      }
    }
  };

  const handleOnClick = () => {
    // Tap to play card (unless it was a long press which shows preview)
    if (!isLongPress.current) {
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
    }
  };

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
    }, LONG_PRESS_TIMER);
  };

  const stopPressTimer = () => {
    clearTimeout(timerRef.current);
  };

  const imgStyles = classNames(styles.img, {
    [styles.border1]: card.borderColor == '1',
    [styles.border2]: card.borderColor == '2',
    [styles.border3]: card.borderColor == '3',
    [styles.border4]: card.borderColor == '4',
    [styles.border5]: card.borderColor == '5',
    [styles.border6]: card.borderColor == '6',
    [styles.border7]: card.borderColor == '7',
    [styles.border8]: card.borderColor == '8',
    [styles.border9]: card.borderColor == '9'
  });

  // Calculate initial position for draw animation
  const getInitialPosition = () => {
    if (isNewlyDrawn) {
      return { opacity: 0, y: 100 };
    }
    return { opacity: 0, y: 100 };
  };

  return (
    <motion.div
      drag
      className={classNames(styles.handCard, {
        [styles.newlyDrawn]: isNewlyDrawn
      })}
      style={{ touchAction: 'none', zIndex }}
      onClick={handleOnClick}
      onTapStart={startPressTimer}
      onTap={stopPressTimer}
      onDragEnd={handleDragEnd}
      onDrag={onDrag}
      dragSnapToOrigin={snapback}
      initial={getInitialPosition()}
      animate={{ opacity: 1, y: 0 }}
      transition={isNewlyDrawn ? { duration: 0.4, ease: 'easeOut' } : { duration: 0.15 }}
      whileHover={{ scale: 1.1, y: -50 }}
    >
      <CardPopUp
        containerClass={styles.imgContainer}
        cardNumber={card.cardNumber}
        isHidden={!canPopUp}
      >
        <CardImage src={src} className={imgStyles} draggable="false" />
        <div className={styles.iconCol}>
          {isArsenal === true && (
            <div className={styles.icon}>
              <GiCannon title="Arsenal" />
            </div>
          )}
          {isBanished === true && (
            <div className={styles.icon}>
              <GiFluffySwirl title="Banished Zone" />
            </div>
          )}
          {isGraveyard === true && (
            <div className={styles.icon}>
              <GiTombstone title="Graveyard" />
            </div>
          )}
          {!!card.restriction && (
            <div className={styles.icon}>
              <GiDialPadlock title="Cannot Play" />
            </div>
          )}
        </div>
      </CardPopUp>
      {card.label && card.label !== '' && (
        <div className={styles.label}>{card.label}</div>
      )}
    </motion.div>
  );
};

export default PlayerHandCard;
