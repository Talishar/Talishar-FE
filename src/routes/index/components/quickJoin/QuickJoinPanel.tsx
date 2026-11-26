import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { FaChevronUp, FaChevronDown, FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useGetHeroMasteryQuery } from 'features/api/apiSlice';
import {
  emptyMastery,
  masteryHeroId,
  progressStart,
  ROMAN_LEVELS
} from 'features/mastery/mastery';
import useAuth from 'hooks/useAuth';
import { useQuickJoin } from './QuickJoinContext';
import DeckBanner, { DeckBannerMastery } from './DeckBanner';
import styles from './QuickJoinPanel.module.css';
import { useTranslation } from 'react-i18next';
import { getCookie, setCookie } from 'utils/cookies';
import Notice, { ServerErrorNotice } from 'components/Notice';
import { PHONE_LANDSCAPE_QUERY } from 'routes/game/lobby/phoneLandscape';

interface Props {
  embedded?: boolean;
  userLayout?: boolean;
}

const QuickJoinPanel = ({ embedded = false, userLayout }: Props) => {
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getCookie('quickJoinPanelExpanded');
    return savedState !== 'false';
  });
  const {
    selectedFavoriteDeck,
    selectedFavoriteDeckHero,
    importDeckUrl,
    saveDeck,
    error,
    importDeckError,
    isJoining,
    favoriteDeckOptions,
    isFavoritesLoading,
    setSelectedFavoriteDeck,
    setImportDeckUrl,
    setSaveDeck,
    setError
  } = useQuickJoin();
  const { data: masteryData } = useGetHeroMasteryQuery(undefined, {
    skip: !isLoggedIn || !selectedFavoriteDeckHero,
    refetchOnMountOrArgChange: true
  });
  const selectedMasteryProgress = selectedFavoriteDeckHero
    ? masteryData?.heroes?.find(
        (hero) => hero.heroId === masteryHeroId(selectedFavoriteDeckHero)
      ) ?? emptyMastery(selectedFavoriteDeckHero)
    : null;
  const importDeckInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCookie('quickJoinPanelExpanded', String(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    const isPhoneLandscape = window.matchMedia(PHONE_LANDSCAPE_QUERY).matches;
    if (error && (window.innerWidth < 768 || isPhoneLandscape)) {
      toast.error(error.title, {
        position: isPhoneLandscape ? 'top-center' : 'top-left'
      });
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    if (importDeckError) {
      importDeckInputRef.current?.focus();
    }
  }, [importDeckError]);

  if (!(userLayout ?? isLoggedIn)) return null;

  let bannerMastery: DeckBannerMastery | null = null;
  if (selectedMasteryProgress) {
    const { qualifyingGames, level, nextThreshold } = selectedMasteryProgress;
    const start = progressStart(level);
    bannerMastery =
      nextThreshold === null
        ? { percent: 100, label: t('MASTERY.HIGHEST_REACHED') }
        : {
            percent: Math.min(
              100,
              ((qualifyingGames - start) / (nextThreshold - start)) * 100
            ),
            label: t('MASTERY.SHORT_PROGRESS', {
              games: qualifyingGames,
              threshold: nextThreshold,
              level: ROMAN_LEVELS[level + 1]
            })
          };
  }

  const deckPlaceholder = isFavoritesLoading
    ? t('BASE.LOADING')
    : favoriteDeckOptions.length === 0
    ? t('JOIN.NO_SAVED_DECKS')
    : importDeckUrl.trim()
    ? t('FIND_MATCH.IMPORTED_DECK')
    : t('JOIN.SELECT_DECK');

  const content = (
    <div className={styles.content}>
      <div className={classNames(styles.row, styles.rowTop)}>
        <span id="quickJoinDeckLabel" className={styles.rowLabel}>
          {t('JOIN.DECK')}
        </span>
        <div className={styles.rowControl}>
          <DeckBanner
            options={favoriteDeckOptions}
            value={selectedFavoriteDeck}
            onChange={setSelectedFavoriteDeck}
            placeholder={deckPlaceholder}
            labelledBy="quickJoinDeckLabel"
            disabled={isFavoritesLoading}
            mastery={bannerMastery}
          />
        </div>
      </div>

      <div className={styles.row}>
        <label
          htmlFor="quickJoinDeckUrl"
          className={styles.rowLabel}
          data-compact-tooltip={t('JOIN.IMPORT_URL_HELP')}
        >
          {t('JOIN.IMPORT_URL')}
        </label>
        <div className={styles.rowControl}>
          <div className={styles.urlField}>
            <input
              id="quickJoinDeckUrl"
              type="text"
              className={styles.textInput}
              placeholder={t('JOIN.DECK_URL_SOURCES_PLACEHOLDER')}
              value={importDeckUrl}
              ref={importDeckInputRef}
              maxLength={500}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 500) return;
                setImportDeckUrl(val);
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text.length <= 500) return;
                e.preventDefault();
                const match = text.match(/https?:\/\/[^\s"'<>]+/);
                if (match) {
                  setImportDeckUrl(match[0].slice(0, 500));
                  toast.success(t('JOIN.URL_EXTRACTED'));
                } else {
                  toast.error(t('JOIN.PASTE_NOT_URL'));
                }
              }}
              aria-invalid={importDeckError ? 'true' : undefined}
              aria-describedby={
                importDeckError ? 'quickJoinDeckUrlError' : undefined
              }
            />
            <button
              type="button"
              className={styles.favoriteButton}
              onClick={() => setSaveDeck(!saveDeck)}
              aria-pressed={saveDeck}
              aria-label={t('JOIN.SAVE_TO_FAVORITES')}
              data-compact-tooltip={t('JOIN.SAVE_TO_FAVORITES')}
            >
              {saveDeck ? <FaHeart size={15} /> : <FaRegHeart size={15} />}
            </button>
          </div>
          {importDeckError && (
            <Notice
              id="quickJoinDeckUrlError"
              tone="error"
              title={importDeckError}
            />
          )}
        </div>
      </div>

      {error && <ServerErrorNotice error={error} />}

      {isJoining && (
        <p className={styles.joiningText} aria-live="polite">
          {t('JOIN.JOINING_GAME')}
        </p>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <section className={styles.panel} aria-label={t('JOIN.QUICK_JOIN')}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('JOIN.QUICK_JOIN')}</h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? t('UNITED_GAME_PANEL.MINIMIZE')
              : t('UNITED_GAME_PANEL.EXPAND')
          }
        >
          {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && content}
    </section>
  );
};

export default QuickJoinPanel;
