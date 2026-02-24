import React from 'react';
import { FaExclamationCircle, FaQuestionCircle } from 'react-icons/fa';
import { ImageSelect } from 'components/ImageSelect';
import useAuth from 'hooks/useAuth';
import { useQuickJoin } from './QuickJoinContext';
import styles from './QuickJoinPanel.module.css';

const QuickJoinPanel = () => {
  const { isLoggedIn } = useAuth();
  const {
    selectedFavoriteDeck,
    importDeckUrl,
    saveDeck,
    detectedFormat,
    error,
    isJoining,
    favoriteDeckOptions,
    isFavoritesLoading,
    setSelectedFavoriteDeck,
    setImportDeckUrl,
    setSaveDeck,
    setError
  } = useQuickJoin();

  if (!isLoggedIn) return null;

  return (
    <section className={styles.panel} aria-label="Use Deck to Join">
      <h3 className={styles.title}>Use Deck to Join</h3>

      <label className={styles.label}>
        Select a Deck
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
          Import Deck&nbsp;
          <span
            title="URL from FaBrary.net or fabdb.net"
            style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}
          >
            <FaQuestionCircle size={13} />
          </span>
        </span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="https://fabrary.net/decks/…"
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
          Format
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
        <p className={styles.hint}>
        {selectedFavoriteDeck || importDeckUrl.trim() ? (
          <>Click <strong>Join</strong> on any open game to join instantly.</>
        ) : (
          <>Select or import a deck above, then click <strong>Join</strong> on any open game.</>
        )}
      </p>

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


    </section>
  );
};

export default QuickJoinPanel;
