import { useState, useEffect } from 'react';
import { FaQuestionCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ImageSelect } from 'components/ImageSelect';
import useAuth from 'hooks/useAuth';
import { useQuickJoin } from './QuickJoinContext';
import styles from './QuickJoinPanel.module.css';
import { Trans, useTranslation } from 'react-i18next';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

interface Props {
  embedded?: boolean;
}

const QuickJoinPanel = ({ embedded = false }: Props) => {
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getCookie('quickJoinPanelExpanded');
    return savedState !== 'false';
  });
  const {
    deckSource,
    selectedFavoriteDeck,
    selectedBazaarDeck,
    importDeckUrl,
    saveDeck,
    error,
    isJoining,
    hasDeckConfigured,
    favoriteDeckOptions,
    isFavoritesLoading,
    bazaarDeckOptions,
    isBazaarLoading,
    bazaarError,
    metafyHash,
    isBazaarEnabled,
    setDeckSource,
    setSelectedFavoriteDeck,
    setSelectedBazaarDeck,
    setImportDeckUrl,
    setSaveDeck,
    setError
  } = useQuickJoin();

  useEffect(() => {
    setCookie('quickJoinPanelExpanded', String(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    if (error && window.innerWidth < 768) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  if (!isLoggedIn) return null;

  const talisharContent = (
    <>
      <label className={styles.label}>
        <ImageSelect
          id="quickJoinFavoriteDeck"
          options={favoriteDeckOptions}
          value={selectedFavoriteDeck}
          onChange={setSelectedFavoriteDeck}
          placeholder={isFavoritesLoading ? 'Loading…' : 'Select a saved deck'}
          aria-busy={isFavoritesLoading}
        />
      </label>

      <label className={styles.label}>
        <span className={styles.labelText}>
          {t('JOIN.IMPORT_DECK_URL')}&nbsp;
          <span
            title={t('JOIN.IMPORT_URL_HELP')}
            style={{
              cursor: 'help',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <FaQuestionCircle size={13} />
          </span>
        </span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Paste deck list URL"
          value={importDeckUrl}
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
              toast.success('URL extracted from pasted content');
            } else {
              toast.error('Pasted content does not appear to be a valid URL');
            }
          }}
          aria-label="Deck URL"
        />
      </label>

      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          role="switch"
          checked={saveDeck}
          onChange={(e) => setSaveDeck(e.target.checked)}
        />
        {t('JOIN.SAVE_DECK_FAVOURITES')}
      </label>
    </>
  );
  const bazaarContent = metafyHash ? (
    <label className={styles.label}>
      <ImageSelect
        id="quickJoinBazaarDeck"
        options={bazaarDeckOptions}
        value={selectedBazaarDeck}
        onChange={setSelectedBazaarDeck}
        placeholder={isBazaarLoading ? 'Loading…' : 'Select a FaB Bazaar deck'}
        aria-busy={isBazaarLoading}
      />
      {bazaarError && <span className={styles.bazaarError}>{bazaarError}</span>}
    </label>
  ) : (
    <p className={styles.bazaarMessage}>
      <Trans
        i18nKey="JOIN.BAZAAR_LINK"
        components={{ 1: <a href="/user/profile" /> }}
      />
    </p>
  );

  const content = (
    <div className={styles.content}>
      <div className={styles.tabBar} role="tablist">
        <button
          role="tab"
          aria-selected={deckSource === 'talishar'}
          className={`${styles.tab} ${
            deckSource === 'talishar' ? styles.tabActive : ''
          }`}
          onClick={() => setDeckSource('talishar')}
        >
          {t('JOIN.TALISHAR_DECKS')}
        </button>
        <button
          role="tab"
          aria-selected={deckSource === 'bazaar'}
          className={`${styles.tab} ${
            deckSource === 'bazaar' ? styles.tabActive : ''
          } ${!isBazaarEnabled ? styles.tabDisabled : ''}`}
          onClick={() => isBazaarEnabled && setDeckSource('bazaar')}
          disabled={!isBazaarEnabled}
          title={!isBazaarEnabled ? t('JOIN.COMING_SOON') : undefined}
        >
          {isBazaarEnabled ? (
            'FaB Bazaar'
          ) : (
            <span className={styles.comingSoonBadge}>
              {t('JOIN.COMING_SOON')}
            </span>
          )}
        </button>
      </div>

      <div className={styles.tabContent}>
        {deckSource === 'talishar' ? talisharContent : bazaarContent}
      </div>

      {!embedded && (
        <p className={styles.hint}>
          {hasDeckConfigured ? (
            <Trans
              i18nKey="JOIN.HINT_DECK_CONFIGURED"
              components={{ 1: <strong /> }}
            />
          ) : (
            <Trans
              i18nKey="JOIN.HINT_SELECT_DECK"
              components={{ 1: <strong /> }}
            />
          )}
        </p>
      )}

      {error && (
        <div className={styles.errorBox} role="alert">
          <span>{error}</span>
        </div>
      )}

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
          aria-label={isExpanded ? 'Minimize panel' : 'Expand panel'}
        >
          {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && content}
    </section>
  );
};

export default QuickJoinPanel;
