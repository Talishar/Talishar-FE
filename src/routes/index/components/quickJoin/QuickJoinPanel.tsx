import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ImageSelect } from 'components/ImageSelect';
import useAuth from 'hooks/useAuth';
import { useQuickJoin } from './QuickJoinContext';
import styles from './QuickJoinPanel.module.css';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

interface Props {
  embedded?: boolean;
}

const QuickJoinPanel = ({ embedded = false }: Props) => {
  const { isLoggedIn } = useAuth();
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
    detectedFormat,
    error,
    isJoining,
    hasDeckConfigured,
    favoriteDeckOptions,
    isFavoritesLoading,
    bazaarDeckOptions,
    isBazaarLoading,
    bazaarError,
    metafyHash,
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
          Import Deck URL&nbsp;
          <span
            title="URL from FaBrary.net or other supported deck list site"
            style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}
          >
            <FaQuestionCircle size={13} />
          </span>
        </span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Paste deck list URL"
          value={importDeckUrl}
          onChange={(e) => setImportDeckUrl(e.target.value)}
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
        Save Deck to ❤️ Favorites
      </label>

      {detectedFormat && (
        <label className={styles.label}>
          Gameplay Format
          <input
            type="text"
            className={styles.textInput}
            value={detectedFormat}
            disabled
            readOnly
            aria-label="Detected deck format"
          />
        </label>
      )}
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
      Link your FaB Bazaar account in your{' '}
      <a href="/user/profile">profile</a> to see your decks here.
    </p>
  );

  const content = (
    <div className={styles.content}>
      <div className={styles.tabBar} role="tablist">
        <button
          role="tab"
          aria-selected={deckSource === 'talishar'}
          className={`${styles.tab} ${deckSource === 'talishar' ? styles.tabActive : ''}`}
          onClick={() => setDeckSource('talishar')}
        >
          Talishar Decks
        </button>
        <button
          role="tab"
          aria-selected={deckSource === 'bazaar'}
          className={`${styles.tab} ${deckSource === 'bazaar' ? styles.tabActive : ''}`}
          onClick={() => setDeckSource('bazaar')}
        >
          FaB Bazaar
        </button>
      </div>

      <div className={styles.tabContent}>
        {deckSource === 'talishar' ? talisharContent : bazaarContent}
      </div>

      {!embedded && (
        <p className={styles.hint}>
          {hasDeckConfigured ? (
            <>
              Click <strong>Join</strong> on any open game to join instantly.
            </>
          ) : (
            <>
              Select a deck above, then click <strong>Join</strong> on any open game.
            </>
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
          Joining game…
        </p>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <section className={styles.panel} aria-label="Quick Join">
      <div className={styles.header}>
        <h3 className={styles.title}>Quick Join</h3>
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

