import React, { useId, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './DevToolPanel.module.css';
import { useLoadDebugGameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { usePanelContext } from '../PanelContext';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

export default function DevToolPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { setIsDevToolOpen, isManualModeOpen } = usePanelContext();
  const location = useLocation();
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );

  // Extract game ID from URL (e.g., /game/play/1145 -> 1145)
  const gameIdFromUrl = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }, [location.pathname]);

  // Only show in dev environment and not on CreateGame page
  if (
    import.meta.env.PROD ||
    location.pathname.includes('/create') ||
    isReplay
  ) {
    return null;
  }

  return (
    <>
      <button
        className={`${styles.devToolTab} ${
          isOpen || isManualModeOpen ? styles.hidden : ''
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsDevToolOpen(!isOpen);
        }}
        title={t('DEV_TOOL.TOGGLE')}
      >
        {t('DEV_TOOL.TITLE')}
      </button>
      {isOpen && (
        <DevToolContent
          gameIdFromUrl={gameIdFromUrl}
          onClose={() => {
            setIsOpen(false);
            setIsDevToolOpen(false);
          }}
        />
      )}
    </>
  );
}

function DevToolContent({
  gameIdFromUrl,
  onClose
}: {
  gameIdFromUrl: string;
  onClose: () => void;
}) {
  const gameIDInput = useId();
  const variantInput = useId();
  const localIDInput = useId();
  const { t } = useTranslation();
  const [gameID, setGameID] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState<string>('0');
  const [localGame, setLocalGame] = useState<string | undefined>(gameIdFromUrl);
  const [debugGameMutation] = useLoadDebugGameMutation();

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const performMutation = async () => {
      // Construct the source game ID with variant
      const sourceGameID = `${gameID?.trim()}-${variant}`;

      try {
        const result = await debugGameMutation({
          source: sourceGameID,
          target: localGame?.trim()
        }).unwrap();

        // Only reload if mutation succeeds
        window.location.reload();
      } catch (error: any) {
        // Parse the error message from the backend or network error
        let errorMessage = 'Failed to load game state';

        if (error?.data?.error) {
          errorMessage = error.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        // Improve message for missing bug reports
        if (errorMessage.includes('does not exist')) {
          errorMessage = `Bug report ${sourceGameID} does not exist. Please check the ID and variant.`;
        } else if (errorMessage.includes('PARSING ERROR')) {
          errorMessage = `Invalid bug report data for ${sourceGameID}. The files may be corrupted.`;
        }

        throw new Error(errorMessage);
      }
    };

    toast.promise(performMutation(), {
      loading: 'Loading debug game state...',
      success: 'Reloading...',
      error: (err: Error) => err.message || 'Failed to load game state'
    });
  };

  return (
    <div className={styles.devToolPanel}>
      <div className={styles.header}>
        <h3>{t('DEV_TOOL.TITLE')}</h3>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={`Close ${t('DEV_TOOL.TITLE')}`}
        >
          <MdClose aria-hidden="true" />
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <label htmlFor={gameIDInput}>{t('DEV_TOOL.DEBUG_GAME_ID')}:</label>
          <input
            id={gameIDInput}
            type="text"
            onChange={(e) => setGameID(e.target.value)}
            placeholder="Enter game ID (e.g., 111)"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={variantInput}>
            {t('DEV_TOOL.BUG_REPORT_VARIANT')}:
          </label>
          <input
            id={variantInput}
            type="number"
            min="0"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="0"
          />
          <small style={{ display: 'block', marginTop: '4px', color: '#888' }}>
            {t('DEV_TOOL.WILL_LOAD')}
          </small>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={localIDInput}>{t('DEV_TOOL.LOCAL_GAME_ID')}:</label>
          <input
            id={localIDInput}
            type="text"
            value={localGame}
            onChange={(e) => setLocalGame(e.target.value)}
            placeholder="Enter local game ID"
          />
        </div>
        <button className={styles.submitButton} onClick={handleButtonClick}>
          {t('DEV_TOOL.REPLACE_LOCAL')}
        </button>
      </div>
    </div>
  );
}
