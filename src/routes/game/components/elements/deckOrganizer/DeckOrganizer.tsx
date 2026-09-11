import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import {
  AiOutlineVerticalAlignBottom,
  AiOutlineVerticalAlignTop
} from 'react-icons/ai';
import classNames from 'classnames';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import { getGameInfo } from 'features/game/GameSlice';
import {
  useGetPopUpContentQuery,
  useProcessInputAPIMutation
} from 'features/api/apiSlice';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './DeckOrganizer.module.css';

const DECK_REORDER_MODE = 111;
const DECK_ORGANIZER_ACTIVITY_MODE = 112;
const ACTIVITY_HEARTBEAT_INTERVAL_MS = 120_000;

interface DeckEntry {
  uid: string;
  // position this card held in the deck the server sent us; the save submits
  // these indices, so no card ID round trip has to survive the trip back
  sourceIndex: number;
  card: Card;
}

const toEntries = (cards: Card[]): DeckEntry[] =>
  cards.map((card, index) => ({
    uid: `${card.cardNumber}-${index}`,
    sourceIndex: index,
    card
  }));

const moveToEnd = (entries: DeckEntry[], uid: string, toTop: boolean) => {
  const index = entries.findIndex((entry) => entry.uid === uid);
  if (index === -1) return entries;
  const next = [...entries];
  const [entry] = next.splice(index, 1);
  if (toTop) next.unshift(entry);
  else next.push(entry);
  return next;
};

const moveBefore = (
  entries: DeckEntry[],
  draggedUid: string,
  targetUid: string | null,
  after: boolean
) => {
  const fromIndex = entries.findIndex((entry) => entry.uid === draggedUid);
  if (fromIndex === -1) return entries;
  const next = [...entries];
  const [entry] = next.splice(fromIndex, 1);
  if (targetUid === null) {
    next.push(entry);
    return next;
  }
  const targetIndex = next.findIndex((item) => item.uid === targetUid);
  if (targetIndex === -1) return entries;
  next.splice(after ? targetIndex + 1 : targetIndex, 0, entry);
  return next;
};

export const DeckOrganizer = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const { lastUpdate } = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo
  );
  const { data, isLoading, isError } = useGetPopUpContentQuery(
    {
      ...gameInfo,
      lastUpdate,
      popupType: 'myDeckPopup'
    },
    { refetchOnMountOrArgChange: true }
  );
  const [processInputAPI, { isLoading: isSaving }] =
    useProcessInputAPIMutation();
  const [reportDeckOrganizerActivity] = useProcessInputAPIMutation();

  const [entries, setEntries] = useState<DeckEntry[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draggedUid, setDraggedUid] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    uid: string;
    after: boolean;
  } | null>(null);

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, onClose);

  useEffect(() => {
    if (!data?.cards || isDirty) return;
    setEntries(toEntries(data.cards));
  }, [data?.cards, isDirty]);

  useEffect(() => {
    const reportActivity = () => {
      void reportDeckOrganizerActivity({
        gameName: gameInfo.gameID,
        playerID: gameInfo.playerID,
        authKey: gameInfo.authKey,
        mode: DECK_ORGANIZER_ACTIVITY_MODE,
        submission: {}
      });
    };

    reportActivity();
    const interval = window.setInterval(
      reportActivity,
      ACTIVITY_HEARTBEAT_INTERVAL_MS
    );
    return () => window.clearInterval(interval);
  }, [
    gameInfo.authKey,
    gameInfo.gameID,
    gameInfo.playerID,
    reportDeckOrganizerActivity
  ]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return entries;
    return entries.filter((entry) =>
      (entry.card.cardName ?? entry.card.cardNumber)
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [entries, searchQuery]);

  const move = (uid: string, toTop: boolean) => {
    setEntries((current) => moveToEnd(current, uid, toTop));
    setIsDirty(true);
  };

  const clearDrag = () => {
    setDraggedUid(null);
    setDropTarget(null);
  };

  const handleDragOverCard = (
    event: React.DragEvent<HTMLDivElement>,
    uid: string
  ) => {
    if (draggedUid === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (uid === draggedUid) {
      setDropTarget(null);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const after = event.clientX > bounds.left + bounds.width / 2;
    setDropTarget({ uid, after });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (draggedUid === null) return;
    event.preventDefault();
    event.stopPropagation();
    if (dropTarget !== null) {
      setEntries((current) =>
        moveBefore(current, draggedUid, dropTarget.uid, dropTarget.after)
      );
      setIsDirty(true);
    }
    clearDrag();
  };

  const handleDropOnList = (event: React.DragEvent<HTMLDivElement>) => {
    if (draggedUid === null || dropTarget !== null) return;
    event.preventDefault();
    setEntries((current) => moveBefore(current, draggedUid, null, false));
    setIsDirty(true);
    clearDrag();
  };

  const handleReset = () => {
    setEntries(toEntries(data?.cards ?? []));
    setIsDirty(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    const result = await processInputAPI({
      gameName: gameInfo.gameID,
      playerID: gameInfo.playerID,
      authKey: gameInfo.authKey,
      mode: DECK_REORDER_MODE,
      submission: { deckOrder: entries.map((entry) => entry.sourceIndex) }
    });
    const serverError =
      'data' in result ? (result.data as { error?: string })?.error : undefined;
    if (serverError || 'error' in result) {
      setSaveError(serverError ?? t('DECK_ORGANIZER.SAVE_FAILED'));
      return;
    }
    setIsDirty(false);
    onClose();
  };

  const positionOf = useMemo(() => {
    const positions = new Map<string, number>();
    entries.forEach((entry, index) => positions.set(entry.uid, index + 1));
    return positions;
  }, [entries]);

  return createPortal(
    <AnimatePresence>
      <div className={styles.emptyOutside} onClick={onClose} />
      <motion.div
        className={styles.organizer}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'tween', duration: 0.12 }}
        key="deckOrganizerBox"
      >
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('DECK_ORGANIZER.CLOSE')}
          >
            <MdClose aria-hidden="true" />
          </button>
          <h3 className={styles.title}>
            {t('DECK_ORGANIZER.TITLE')}
            <span className={styles.count}>{entries.length}</span>
          </h3>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('DECK_ORGANIZER.SEARCH')}
            aria-label={t('DECK_ORGANIZER.SEARCH')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDownCapture={(event) => event.stopPropagation()}
          />
        </div>
        <p className={styles.hint}>{t('DECK_ORGANIZER.HINT')}</p>
        <div
          className={styles.cardList}
          onDragOver={(event) => {
            if (draggedUid !== null) event.preventDefault();
          }}
          onDrop={handleDropOnList}
        >
          {isLoading && (
            <div className={styles.message}>{t('CARD_LIST.LOADING')}</div>
          )}
          {isError && (
            <div className={styles.message}>{t('CARD_LIST.ERROR')}</div>
          )}
          {!isLoading &&
            !isError &&
            filteredEntries.map((entry) => (
              <div
                className={classNames(styles.cardTile, {
                  [styles.dragging]: draggedUid === entry.uid,
                  [styles.dropBefore]:
                    dropTarget?.uid === entry.uid && !dropTarget.after,
                  [styles.dropAfter]:
                    dropTarget?.uid === entry.uid && dropTarget.after
                })}
                key={entry.uid}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', entry.uid);
                  setDraggedUid(entry.uid);
                }}
                onDragEnd={clearDrag}
                onDragOver={(event) => handleDragOverCard(event, entry.uid)}
                onDrop={handleDrop}
              >
                <span className={styles.position}>
                  {positionOf.get(entry.uid)}
                </span>
                <div className={styles.cardSlot}>
                  <CardDisplay card={entry.card} isPlayer preventUseOnClick />
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.moveButton}
                    onClick={() => move(entry.uid, true)}
                    title={t('DECK_ORGANIZER.MOVE_TO_TOP')}
                    aria-label={t('DECK_ORGANIZER.MOVE_TO_TOP')}
                  >
                    <AiOutlineVerticalAlignTop aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.moveButton}
                    onClick={() => move(entry.uid, false)}
                    title={t('DECK_ORGANIZER.MOVE_TO_BOTTOM')}
                    aria-label={t('DECK_ORGANIZER.MOVE_TO_BOTTOM')}
                  >
                    <AiOutlineVerticalAlignBottom aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          {!isLoading && !isError && filteredEntries.length === 0 && (
            <div className={styles.message}>
              {t('CARD_LIST.NO_CARDS_IN_ZONE')}
            </div>
          )}
        </div>
        <div className={styles.footer}>
          {saveError && <span className={styles.saveError}>{saveError}</span>}
          <button
            type="button"
            className={styles.footerButton}
            onClick={handleReset}
            disabled={!isDirty || isSaving}
          >
            {t('DECK_ORGANIZER.RESET')}
          </button>
          <button
            type="button"
            className={styles.footerButton}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? t('DECK_ORGANIZER.SAVING') : t('DECK_ORGANIZER.SAVE')}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DeckOrganizer;
