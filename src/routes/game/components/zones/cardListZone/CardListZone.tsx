import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  clearCardListFocus,
  setCardListFocus,
  toggleCardListSort,
  getGameInfo
} from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { FaTimes } from 'react-icons/fa';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { shallowEqual } from 'react-redux';
import { Card, isAllyCard } from 'features/Card';
import { useTranslation } from 'react-i18next';
import { filterCardsByQuery, selectCardListLastUpdate } from './cardListUtils';

const SORT_PREFERENCE_KEY = 'cardListZone_sortPreference';

export const CardListZone = () => {
  const showModal = useShowModal();
  const { t } = useTranslation();
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();
  const [lastOpenedName, setLastOpenedName] = React.useState<string | null>(
    null
  );
  const [lastSortState, setLastSortState] = React.useState<boolean | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Apply sort preference when a new card list is opened
  useEffect(() => {
    if (
      cardList?.active &&
      cardList?.name &&
      cardList?.name !== lastOpenedName &&
      !cardList?.apiCall
    ) {
      const savedSortPreference =
        localStorage.getItem(SORT_PREFERENCE_KEY) === 'true';
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

  const reversedList = useMemo(() => {
    if (!cardList?.cardList) return null;
    const nonBacks: Card[] = [];
    const backs: Card[] = [];

    for (let index = cardList.cardList.length - 1; index >= 0; index -= 1) {
      const card = cardList.cardList[index];
      if (card.cardNumber.toLowerCase() === 'cardback') backs.push(card);
      else nonBacks.push(card);
    }
    for (const card of backs) nonBacks.push(card);

    return nonBacks;
  }, [cardList?.cardList]);

  const isOpponentZone = cardList?.name?.includes("Opponent's") ?? false;

  const showSortAndSearch = !!(
    cardList?.name &&
    (cardList.name.includes('Your Graveyard') ||
      cardList.name.includes("Opponent's Graveyard") ||
      cardList.name.includes('Your Banish') ||
      cardList.name.includes("Opponent's Banish") ||
      cardList.name.includes('Your Deck') ||
      cardList.name.includes("Opponent's Deck") ||
      cardList.name.includes('Your Soul') ||
      cardList.name.includes("Opponent's Soul") ||
      cardList.name.includes('Your Pitch') ||
      cardList.name.includes("Opponent's Pitch") ||
      cardList.name.includes('Your Hand') ||
      cardList.name.includes("Opponent's Hand"))
  );

  const filteredList = useMemo(() => {
    return filterCardsByQuery(reversedList, searchQuery);
  }, [reversedList, searchQuery]);

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
        <>
          <div className={styles.emptyOutside} onClick={closeCardList} />
          <motion.div
            className={styles.cardListBox}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'tween', duration: 0.12 }}
            key="playerInputPopupBox"
          >
            <div className={styles.cardListTitleContainer}>
              <button
                type="button"
                className={styles.cardListCloseIcon}
                onClick={closeCardList}
                aria-label={t('PLAYER_INPUT.CLOSE_POPUP')}
              >
                <FaTimes aria-hidden="true" />
              </button>
              <div className={styles.cardListTitle}>
                <h3 className={styles.title}>{cardList?.name}</h3>
              </div>
              {showSortAndSearch && (
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t('PLAYER_INPUT.SEARCH_CARDS')}
                  aria-label={t('PLAYER_INPUT.SEARCH_CARDS')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {showSortAndSearch && (
                <button
                  className={`${styles.button} ${
                    cardList?.isSorted ? styles.active : ''
                  }`}
                  onClick={handleSort}
                  aria-pressed={cardList?.isSorted}
                >
                  {t('CARD_LIST.SORT')}
                </button>
              )}
            </div>
            {cardList?.apiCall ? (
              <CardListZoneAPI
                name={cardList.apiQuery ?? ''}
                searchQuery={searchQuery}
                isOpponentZone={cardList?.name?.includes("Opponent's") ?? false}
              />
            ) : (
              <div className={styles.cardListContents}>
                {filteredList && filteredList.length > 0 ? (
                  filteredList.map((card: Card, ix: number) => (
                    <CardDisplay
                      card={card}
                      key={`${card.cardNumber}_${ix}`}
                      isPlayer={!isOpponentZone}
                      highlightSubtype={isAllyCard(card)}
                    />
                  ))
                ) : searchQuery ? (
                  <div className={styles.noResults}>
                    {t('CARD_LIST.NO_CARDS_FOUND', { searchQuery })}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    {t('CARD_LIST.NO_CARDS_IN_ZONE')}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface CardListZoneAPI {
  name: string;
  searchQuery: string;
  isOpponentZone?: boolean;
}

const CardListZoneAPI = ({
  name,
  searchQuery,
  isOpponentZone
}: CardListZoneAPI) => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const { t } = useTranslation();
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();
  const lastUpdate = useAppSelector(selectCardListLastUpdate);
  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    lastUpdate,
    popupType: name
  });

  // When API data arrives, populate the Redux cardList state so sorting can work
  useEffect(() => {
    if (data?.cards && cardList?.apiCall && !cardList?.cardList) {
      dispatch(
        setCardListFocus({
          cardList: data.cards,
          name: cardList?.name
        })
      );
    }
  }, [
    data?.cards,
    cardList?.apiCall,
    cardList?.cardList,
    cardList?.name,
    dispatch
  ]);

  // Use Redux cardList if available (for sorting), otherwise use API data
  const cardsToDisplay = cardList?.cardList || data?.cards;

  const filteredCards = useMemo(
    () => filterCardsByQuery(cardsToDisplay ?? null, searchQuery),
    [cardsToDisplay, searchQuery]
  );

  let content;
  if (isLoading) {
    content = <div>{t('CARD_LIST.LOADING')}</div>;
  }
  if (isError) {
    content = <div>{t('CARD_LIST.ERROR')}</div>;
  }
  if (filteredCards != undefined) {
    content = (
      <div className={styles.cardListContents}>
        {filteredCards.length > 0 ? (
          filteredCards.map((card: Card, ix: number) => {
            return (
              <CardDisplay
                card={card}
                key={`${card.cardNumber}_${ix}`}
                isPlayer={!isOpponentZone}
                highlightSubtype={isAllyCard(card)}
              />
            );
          })
        ) : searchQuery ? (
          <div className={styles.noResults}>
            {t('CARD_LIST.NO_CARDS_FOUND', { searchQuery })}
          </div>
        ) : (
          <div className={styles.noResults}>
            {t('CARD_LIST.NO_CARDS_IN_ZONE')}
          </div>
        )}
      </div>
    );
  }

  return <>{content}</>;
};

export default CardListZone;
