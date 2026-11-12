import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  clearCardListFocus,
  setCardListFocus,
  setCardListLoadFocus,
  toggleCardListSort,
  getGameInfo
} from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './CardListZone.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import { shallowEqual } from 'react-redux';
import { Card, isAllyCard } from 'features/Card';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

const CARD_LIST_OPEN_BODY_CLASS = 'cardListOpen';

const matchesQuery = (card: Card, normalizedQuery: string): boolean =>
  (card.cardName?.toLowerCase().includes(normalizedQuery) ?? false) ||
  (card.sType?.toLowerCase().includes(normalizedQuery) ?? false);

const PILE_ORDER = [
  'INT',
  'PLAY',
  'PLAYNEXT',
  'TRAPDOOR',
  'POWER6',
  'BLOODDEBT',
  'EARTH',
  'ALLY'
];
const KNOWN_PILES = new Set([...PILE_ORDER, 'DOWN']);
const NAMED_PILE_RANK = PILE_ORDER.indexOf('TRAPDOOR') + 0.5;

const pileRank = (pile: string): number => {
  if (pile === 'DOWN') return PILE_ORDER.length + 1;
  if (pile === '') return PILE_ORDER.length;
  const rank = PILE_ORDER.indexOf(pile);
  return rank === -1 ? NAMED_PILE_RANK : rank;
};

const cardPile = (card: Card): string =>
  card.pile ?? (isAllyCard(card) ? 'ALLY' : '');

const ZONE_SWITCH = /^(Your|Opponent's) (Graveyard|Banish Zone|Soul)$/;
const SWITCH_ZONES = [
  { zone: 'Graveyard', label: 'ZONES.GRAVEYARD' },
  { zone: 'Banish Zone', label: 'ZONES.BANISH' },
  { zone: 'Soul', label: 'ZONES.SOUL' }
] as const;
const EMPTY_CARDS: Card[] = [];

interface Pile {
  pile: string;
  cards: Card[];
}

const groupIntoPiles = (cards: Card[]): Pile[] | null => {
  const piles = new Map<string, Card[]>();
  for (const card of cards) {
    const pile = cardPile(card);
    const pileCards = piles.get(pile);
    if (pileCards) pileCards.push(card);
    else piles.set(pile, [card]);
  }
  if (piles.size === 0 || (piles.size === 1 && piles.has(''))) return null;
  return Array.from(piles, ([pile, pileCards]) => ({
    pile,
    cards: pileCards
  })).sort((a, b) => pileRank(a.pile) - pileRank(b.pile));
};

interface CardListCardsProps {
  cards: Card[];
  searchQuery: string;
  isOpponentZone?: boolean;
}

const CardListCards = ({
  cards,
  searchQuery,
  isOpponentZone
}: CardListCardsProps) => {
  const { t } = useTranslation();
  const piles = useMemo(() => groupIntoPiles(cards), [cards]);

  const renderCard = (card: Card, key: string) => (
    <CardDisplay card={card} key={key} isPlayer={!isOpponentZone} />
  );

  if (cards.length === 0) {
    return (
      <div className={styles.cardListContents}>
        <div className={styles.noResults}>
          {searchQuery
            ? t('CARD_LIST.NO_CARDS_FOUND', { searchQuery })
            : t('CARD_LIST.NO_CARDS_IN_ZONE')}
        </div>
      </div>
    );
  }

  if (!piles) {
    return (
      <div className={styles.cardListContents}>
        {cards.map((card, ix) => renderCard(card, `${card.cardNumber}_${ix}`))}
      </div>
    );
  }

  return (
    <div className={`${styles.cardListContents} ${styles.pileList}`}>
      {piles.map(({ pile, cards: pileCards }) => {
        const name = KNOWN_PILES.has(pile)
          ? t(`CARD_LIST.PILE.${pile}`)
          : pile || t('CARD_LIST.PILE.OTHER');
        return (
          <div
            key={`pile_${pile}`}
            role="group"
            aria-label={name}
            className={styles.pile}
          >
            <h4 className={styles.pileTitle}>
              {name} ({pileCards.length})
            </h4>
            <div className={styles.pileCards}>
              {pileCards.map((card, ix) =>
                renderCard(card, `${pile}_${card.cardNumber}_${ix}`)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const CardListZone = () => {
  const showModal = useShowModal();
  const { t } = useTranslation();
  const cardList = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isOpen = Boolean(showModal && cardList?.active);

  useLayoutEffect(() => {
    if (isOpen) document.body.classList.add(CARD_LIST_OPEN_BODY_CLASS);
  }, [isOpen]);

  useEffect(
    () => () => document.body.classList.remove(CARD_LIST_OPEN_BODY_CLASS),
    []
  );

  // Clear the search when a different card list is opened.
  useEffect(() => {
    setSearchQuery('');
  }, [cardList?.active, cardList?.name]);

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

  const zoneSwitch = cardList?.name ? ZONE_SWITCH.exec(cardList.name) : null;
  const switchOwnerIsPlayer = zoneSwitch?.[1] === 'Your';
  const switchZoneCards = useAppSelector((state: RootState) => {
    if (!zoneSwitch) return undefined;
    const owner = switchOwnerIsPlayer
      ? state.game.playerOne
      : state.game.playerTwo;
    return {
      Graveyard: owner.Graveyard,
      'Banish Zone': owner.Banish,
      soulCount: owner.SoulCount
    };
  }, shallowEqual);

  const zoneCount = (zone: (typeof SWITCH_ZONES)[number]['zone']): number =>
    zone === 'Soul'
      ? switchZoneCards?.soulCount ?? 0
      : switchZoneCards?.[zone]?.length ?? 0;

  const switchZone = (zone: (typeof SWITCH_ZONES)[number]['zone']) => {
    if (!zoneSwitch) return;
    const name = `${zoneSwitch[1]} ${zone}`;
    if (zone === 'Soul') {
      dispatch(
        setCardListLoadFocus({
          query: switchOwnerIsPlayer ? 'mySoulPopup' : 'theirSoulPopup',
          name
        })
      );
    } else {
      dispatch(setCardListFocus({ cardList: switchZoneCards?.[zone], name }));
    }
  };

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
    if (!reversedList || !searchQuery) return reversedList;
    const normalizedQuery = searchQuery.toLowerCase();
    return reversedList.filter((card: Card) =>
      matchesQuery(card, normalizedQuery)
    );
  }, [reversedList, searchQuery]);

  const closeCardList = () => {
    dispatch(clearCardListFocus());
    setSearchQuery('');
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, closeCardList);

  const handleSort = () => {
    dispatch(toggleCardListSort());
  };

  return (
    <AnimatePresence
      onExitComplete={() =>
        document.body.classList.remove(CARD_LIST_OPEN_BODY_CLASS)
      }
    >
      {isOpen && (
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
                <MdClose aria-hidden="true" />
              </button>
              <div className={styles.cardListTitle}>
                <h3 className={styles.title}>{cardList?.name}</h3>
              </div>
              {zoneSwitch &&
                SWITCH_ZONES.map(({ zone, label }) => {
                  const count = zoneCount(zone);
                  if (zone === zoneSwitch[2] || count <= 0) return null;
                  return (
                    <button
                      key={zone}
                      type="button"
                      className={`${styles.button} ${styles.zoneSwitchButton}`}
                      onClick={() => switchZone(zone)}
                    >
                      {t(label)} ({count})
                    </button>
                  );
                })}
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
                  type="button"
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
              <CardListCards
                cards={filteredList ?? EMPTY_CARDS}
                searchQuery={searchQuery}
                isOpponentZone={isOpponentZone}
              />
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

  let filteredCards = cardsToDisplay ?? null;
  if (filteredCards && searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase();
    filteredCards = filteredCards.filter((card: Card) =>
      matchesQuery(card, normalizedQuery)
    );
  }

  let content;
  if (isLoading) {
    content = <div>{t('CARD_LIST.LOADING')}</div>;
  }
  if (isError) {
    content = <div>{t('CARD_LIST.ERROR')}</div>;
  }
  if (filteredCards != undefined) {
    content = (
      <CardListCards
        cards={filteredCards}
        searchQuery={searchQuery}
        isOpponentZone={isOpponentZone}
      />
    );
  }

  return <>{content}</>;
};

export default CardListZone;
