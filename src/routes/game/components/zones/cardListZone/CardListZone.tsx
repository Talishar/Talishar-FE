import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearCardListFocus, setCardListFocus, getGameInfo } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { shallowEqual } from 'react-redux';

export const CardListZone = () => {
  const showModal = useShowModal();
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();

  const reversedList = cardList?.cardList
    ? [...cardList.cardList].reverse()
    : null;

  const closeCardList = () => {
    dispatch(clearCardListFocus());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  const handleSort = () => {
  if (cardList && cardList.cardList && cardList.name) {
    const sortedCardList = [...cardList.cardList].sort((a, b) => a.cardNumber.localeCompare(b.cardNumber));
    dispatch(setCardListFocus({ cardList: sortedCardList, name: cardList.name }));
  }
};

  return (
    <AnimatePresence>
      {showModal && cardList?.active && (
        <motion.div
          className={styles.cardListBox}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          key="playerInputPopupBox"
        >
          <div className={styles.cardListTitleContainer}>
            <div className={styles.cardListTitle}>
              <h3 className={styles.title}>{cardList?.name}</h3>
            </div>
            {(cardList && cardList.name && 
              (
                cardList.name.includes('Your Opponent\'s Graveyard') ||
                cardList.name.includes('Your Graveyard') ||
                cardList.name.includes('Your Banish') ||
                cardList.name.includes('Your Opponent\'s Banish')
              )) && (
              <button className={styles.button} onClick={handleSort}>Sort</button>
            )}
            <div className={styles.cardListCloseIcon} onClick={closeCardList}>
              <FaTimes title="Close Dialog" />
            </div>
          </div>
          {cardList?.apiCall ? (
            <CardListZoneAPI name={cardList.apiQuery ?? ''} />
          ) : (
            <div className={styles.cardListContents}>
              {reversedList &&
                reversedList.map((card, ix) => {
                  return <CardDisplay card={card} key={ix} />;
                })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CardListZoneAPI {
  name: string;
}

const CardListZoneAPI = ({ name }: CardListZoneAPI) => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const { lastUpdate } = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo
  );
  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    lastUpdate,
    popupType: name
  });

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  }
  if (isError) {
    content = <div>Error!</div>;
  }
  if (data != undefined) {
    content = (
      <div className={styles.cardListContents}>
        {data.cards.map((card: any, ix: number) => {
          return <CardDisplay card={card} key={ix} />;
        })}
      </div>
    );
  }

  return <>{content}</>;
};

export default CardListZone;
