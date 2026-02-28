import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { clearCardListFocus, setCardListFocus, toggleCardListSort, getGameInfo } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { shallowEqual } from 'react-redux';
import { Card } from 'features/Card';

const SORT_PREFERENCE_KEY = 'cardListZone_sortPreference';

export const CardListZone = () => {
  const showModal = useShowModal();
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();
  const [lastOpenedName, setLastOpenedName] = React.useState<string | null>(null);
  const [lastSortState, setLastSortState] = React.useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Apply sort preference when a new card list is opened
  useEffect(() => {
    if (cardList?.active && cardList?.name && cardList?.name !== lastOpenedName && !cardList?.apiCall) {
      const savedSortPreference = localStorage.getItem(SORT_PREFERENCE_KEY) === 'true';
      if (savedSortPreference && !cardList.isSorted) {
        dispatch(toggleCardListSort());
      }
      setLastOpenedName(cardList.name);
      setLastSortState(cardList.isSorted ?? false);
      setSearchQuery(''); // Clear search when opening a new zone
    } else if (!cardList?.active && lastOpenedName && lastSortState !== null) {
      // Save sort preference when closing
      localStorage.setItem(SORT_PREFERENCE_KEY, String(lastSortState));
      setLastOpenedName(null);
      setLastSortState(null);
      setSearchQuery(''); // Clear search when closing
    }
  }, [cardList?.active, cardList?.name, lastSortState]);

  // Track sort state changes while open
  useEffect(() => {
    if (cardList?.active) {
      setLastSortState(cardList.isSorted ?? false);
    }
  }, [cardList?.isSorted]);

  const reversedList = cardList?.cardList
    ? [...cardList.cardList].reverse()
    : null;

  const filteredList = reversedList?.filter(card =>
    !searchQuery || card.cardName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? null;

  const closeCardList = () => {
    dispatch(clearCardListFocus());
    setLastOpenedName(null);
    setSearchQuery('');
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  const handleSort = () => {
    dispatch(toggleCardListSort());
    // Save the sort preference after toggling
    const newSortState = !cardList?.isSorted;
    localStorage.setItem(SORT_PREFERENCE_KEY, String(newSortState));
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
            <div className={styles.cardListCloseIcon} onClick={closeCardList}>
              <FaTimes title="Close Dialog" />
            </div>
            <div className={styles.cardListTitle}>
              <h3 className={styles.title}>{cardList?.name}</h3>
            </div>
            {(cardList && cardList.name && 
              (
                cardList.name.includes('Your Graveyard') ||
                cardList.name.includes('Opponent\'s Graveyard') ||
                cardList.name.includes('Your Banish') ||
                cardList.name.includes('Opponent\'s Banish') ||
                cardList.name.includes('Your Deck') ||
                cardList.name.includes('Opponent\'s Deck') ||
                cardList.name.includes('Your Soul') ||
                cardList.name.includes('Opponent\'s Soul') ||
                cardList.name.includes('Your Pitch') ||
                cardList.name.includes('Opponent\'s Pitch')
              )) && (
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {(cardList && cardList.name && 
              (
                cardList.name.includes('Your Graveyard') ||
                cardList.name.includes('Opponent\'s Graveyard') ||
                cardList.name.includes('Your Banish') ||
                cardList.name.includes('Opponent\'s Banish') ||
                cardList.name.includes('Your Deck') ||
                cardList.name.includes('Opponent\'s Deck') ||
                cardList.name.includes('Your Soul') ||
                cardList.name.includes('Opponent\'s Soul') ||
                cardList.name.includes('Your Pitch') ||
                cardList.name.includes('Opponent\'s Pitch')
              )) && (
              <button 
                className={`${styles.button} ${cardList?.isSorted ? styles.active : ''}`}
                onClick={handleSort}
                title={cardList?.isSorted ? 'Click to unsort' : 'Click to sort'}
              >
                Sort
              </button>
            )}
          </div>
          {cardList?.apiCall ? (
            <CardListZoneAPI name={cardList.apiQuery ?? ''} searchQuery={searchQuery} />
          ) : (
            <div className={styles.cardListContents}>
              {filteredList && filteredList.length > 0 ? (
                filteredList.map((card: Card, ix) => {
                  return <CardDisplay card={card} key={ix} />;
                })
              ) : searchQuery ? (
                <div className={styles.noResults}>No cards found matching "{searchQuery}"</div>
              ) : (
                <div className={styles.noResults}>No cards in this zone</div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CardListZoneAPI {
  name: string;
  searchQuery: string;
}

const CardListZoneAPI = ({ name, searchQuery }: CardListZoneAPI) => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();
  const { lastUpdate } = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo
  );
  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    lastUpdate,
    popupType: name
  });

  // When API data arrives, populate the Redux cardList state so sorting can work
  useEffect(() => {
    if (data?.cards && cardList?.apiCall && !cardList?.cardList) {
      dispatch(setCardListFocus({
        cardList: data.cards,
        name: cardList?.name
      }));
    }
  }, [data?.cards, cardList?.apiCall, cardList?.cardList, cardList?.name, dispatch]);

  // Use Redux cardList if available (for sorting), otherwise use API data
  const cardsToDisplay = cardList?.cardList || data?.cards;

  const filteredCards = cardsToDisplay?.filter(card =>
    !searchQuery || card.cardName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? null;

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  }
  if (isError) {
    content = <div>Error!</div>;
  }
  if (filteredCards != undefined) {
    content = (
      <div className={styles.cardListContents}>
        {filteredCards.length > 0 ? (
          filteredCards.map((card: Card, ix: number) => {
            return <CardDisplay card={card} key={ix} />;
          })
        ) : searchQuery ? (
          <div className={styles.noResults}>No cards found matching "{searchQuery}"</div>
        ) : (
          <div className={styles.noResults}>No cards in this zone</div>
        )}
      </div>
    );
  }

  return <>{content}</>;
};

export default CardListZone;
