import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useNavigate } from 'react-router-dom';
import {
  closeOptionsMenu,
  getGameInfo,
  setDeckCosmetics,
  submitButton
} from 'features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './OptionsMenu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import OptionsSettings from './OptionsSettings';
import { shallowEqual } from 'react-redux';
import {
  apiSlice,
  useGetCosmeticsQuery,
  useSaveDeckCosmeticsMutation
} from 'features/api/apiSlice';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { CosmeticsSection } from './OptionsSettings/CosmeticsSection';
import type { Setting } from 'features/options/optionsSlice';
import * as optConst from 'features/options/constants';
import { CARD_BACK, PLAYMATS } from 'features/options/cardBacks';

const OptionsContent = () => {
  const {
    gameID,
    playerID,
    deckLink,
    canCustomizeDeck,
    deckCardBackId,
    deckPlaymatId
  } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [allowSpectator, setAllowSpectator] = useState(false);
  const [selectedCardBack, setSelectedCardBack] = useState(
    deckCardBackId ?? '0'
  );
  const [selectedPlaymat, setSelectedPlaymat] = useState(deckPlaymatId ?? '0');
  const { data: cosmeticsData } = useGetCosmeticsQuery(undefined, {
    skip: !canCustomizeDeck
  });
  const [saveDeckCosmetics, { isLoading: isSavingCosmetics }] =
    useSaveDeckCosmeticsMutation();

  useEffect(() => {
    setSelectedCardBack(deckCardBackId ?? '0');
    setSelectedPlaymat(deckPlaymatId ?? '0');
  }, [deckCardBackId, deckPlaymatId]);

  const cosmeticsChanged =
    selectedCardBack !== (deckCardBackId ?? '0') ||
    selectedPlaymat !== (deckPlaymatId ?? '0');

  const handleDeckCosmeticChange = ({ name, value }: Setting) => {
    if (name === optConst.CARD_BACK) setSelectedCardBack(String(value));
    if (name === optConst.MY_PLAYMAT) setSelectedPlaymat(String(value));
  };

  const handleSaveDeckCosmetics = async () => {
    if (!deckLink) return;
    try {
      await saveDeckCosmetics({
        decklink: deckLink,
        cardBackId: selectedCardBack,
        playmatId: selectedPlaymat
      }).unwrap();
      dispatch(
        setDeckCosmetics({
          cardBackId: selectedCardBack,
          playmatId: selectedPlaymat,
          cardBack: CARD_BACK[selectedCardBack],
          playmat: PLAYMATS[selectedPlaymat]
        })
      );
      toast.success(t('OPTIONS_MENU.COSMETICS_DECK_SAVED'), {
        position: 'top-center'
      });
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? t('OPTIONS_MENU.COSMETICS_DECK_SAVE_ERROR'),
        { position: 'top-center' }
      );
    }
  };

  const gameURL = `${window.location.origin}/game/play/${gameID}`;

  const clickCloseOptionsHandler = () => {
    dispatch(closeOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, clickCloseOptionsHandler);

  const clickConcedeGameHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.CONCEDE_GAME } }));
  };

  // going to main menu means you concede the game
  const handleClickMainMenuButton = async (e: React.MouseEvent) => {
    e.preventDefault();
    clickConcedeGameHandler();
    dispatch(
      apiSlice.util.invalidateTags([{ type: 'UserProfile', id: 'LIST' }])
    );
    navigate('/');
    clickCloseOptionsHandler();
  };

  const clickReportBugHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.REPORT_BUG } }));
    clickCloseOptionsHandler();
  };

  const clickReportPlayerHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.REPORT_PLAYER } }));
    clickCloseOptionsHandler();
  };

  const clickUndoButtonHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
    clickCloseOptionsHandler();
  };

  const clickRevertToStartOfThisTurnHandler = () => {
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.REVERT_TO_PRIOR_TURN,
          buttonInput: 'beginTurnGamestate.txt'
        }
      })
    );
    clickCloseOptionsHandler();
  };

  const handleAllowSpectators = () => {
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.ALLOW_SPECTATORS } })
    );
    setAllowSpectator(true);
  };

  const clickRevertToStartOfChainLinkHandler = () => {
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.REVERT_TO_PRIOR_TURN,
          buttonInput: 'startChainLinkGamestate.txt'
        }
      })
    );
    clickCloseOptionsHandler();
  };

  const clickRevertToStartOfPreviousTurnHandler = () => {
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.REVERT_TO_PRIOR_TURN,
          buttonInput: 'lastTurnGamestate.txt'
        }
      })
    );
    clickCloseOptionsHandler();
  };

  const clickCopySpectateToClipboardHandler = async () => {
    try {
      await navigator.clipboard.writeText(gameURL);
      toast.success(t('GAME_LOBBY.COPIED'), { position: 'top-center' });
    } catch {
      toast.error(t('BASE.ERROR_ALERT'), { position: 'top-center' });
    }
  };

  return (
    <div className={styles.optionsContentContainer}>
      <div className={styles.column}>
        <OptionsSettings />
      </div>
      <div className={`${styles.column} ${styles.rightColumn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span>{t('OPTIONS_MENU.GENERAL')}</span>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.buttonColumn}>
              <button
                className={styles.buttonDiv}
                onClick={handleClickMainMenuButton}
              >
                {t('OPTIONS_MENU.HOMEPAGE')}
              </button>
              {playerID !== 3 && ( // If not a spectator then can change options
                <>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickConcedeGameHandler}
                  >
                    {t('OPTIONS_MENU.CONCEDE')}
                  </button>

                  <button
                    className={styles.buttonDiv}
                    onClick={clickReportBugHandler}
                  >
                    {t('OPTIONS_MENU.REPORT_BUG')}
                  </button>

                  <button
                    className={styles.buttonDiv}
                    onClick={clickReportPlayerHandler}
                  >
                    {t('OPTIONS_MENU.REPORT_PLAYER')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {playerID !== 3 && (
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span>{t('OPTIONS_MENU.GAMESTATE_CORRECTION')}</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.buttonColumn}>
                <button
                  className={styles.buttonDiv}
                  onClick={clickUndoButtonHandler}
                >
                  {t('OPTIONS_MENU.UNDO')}
                </button>
                <button
                  className={styles.buttonDiv}
                  onClick={clickRevertToStartOfThisTurnHandler}
                >
                  {t('OPTIONS_MENU.REVERT_TO_START_OF_THIS_TURN')}
                </button>
                <button
                  className={styles.buttonDiv}
                  onClick={clickRevertToStartOfChainLinkHandler}
                >
                  {t('OPTIONS_MENU.REVERT_TO_START_OF_THIS_CHAIN_LINK')}
                </button>
                <button
                  className={styles.buttonDiv}
                  onClick={clickRevertToStartOfPreviousTurnHandler}
                >
                  {t('OPTIONS_MENU.REVERT_TO_START_OF_PREVIOUS_TURN')}
                </button>
              </div>
            </div>
          </div>
        )}

        {playerID !== 3 && (
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span>{t('OPTIONS_MENU.INVITE_SPECTATORS')}</span>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.buttonColumn}>
                {!allowSpectator ? (
                  <button
                    className={styles.buttonDiv}
                    onClick={handleAllowSpectators}
                  >
                    {t('OPTIONS_MENU.ALLOW_SPECTATORS_PRIVATE_MATCH')}
                  </button>
                ) : (
                  <button
                    className={styles.buttonDiv}
                    onClick={clickCopySpectateToClipboardHandler}
                  >
                    {t('OPTIONS_MENU.COPY_SPECTATE_LINK')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div
          className={`${styles.sectionContainer} ${styles.cosmeticsSection}`}
        >
          <div className={styles.sectionHeader}>
            <span>{t('OPTIONS_MENU.COSMETICS')}</span>
          </div>
          <div className={styles.sectionContent}>
            {playerID !== 3 && canCustomizeDeck && deckLink ? (
              <>
                <p className={styles.signpostNote}>
                  {t('OPTIONS_MENU.COSMETICS_DECK_NOTE')}
                </p>
                {cosmeticsChanged && !isSavingCosmetics && (
                  <button
                    className={styles.cosmeticsSaveButton}
                    onClick={handleSaveDeckCosmetics}
                  >
                    {t('OPTIONS_MENU.SAVE_COSMETICS_TO_DECK')}
                  </button>
                )}
                <CosmeticsSection
                  data={cosmeticsData}
                  selectedCardBack={selectedCardBack}
                  selectedPlaymat={selectedPlaymat}
                  onSettingsChange={handleDeckCosmeticChange}
                />
              </>
            ) : (
              <p className={styles.signpostNote}>
                <Trans
                  i18nKey="OPTIONS_MENU.COSMETICS_SIGNPOST"
                  components={{
                    1: (
                      <a
                        href="/user/settings"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                    2: <a href="/user/decks" target="_blank" rel="noreferrer" />
                  }}
                />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OptionsMenu() {
  const showModal = useShowModal();
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const closeOptions = () => {
    dispatch(closeOptionsMenu());
  };

  return (
    <AnimatePresence>
      {optionsMenu?.active && showModal && (
        <>
          <div className={styles.optionsBackdrop} onClick={closeOptions} />
          <motion.div
            className={styles.optionsContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            key="optionsMenuPopup"
          >
            <div className={styles.optionsTitleContainer}>
              <hgroup className={styles.optionsTitle}>
                <h2 className={styles.title}>
                  {t('OPTIONS_MENU.SETTINGS_MENU')}
                </h2>
                <h4></h4>
              </hgroup>
              <div
                className={styles.optionsMenuCloseIcon}
                onClick={closeOptions}
                data-testid="close-button"
              >
                <FaTimes title={t('OPTIONS_MENU.CLOSE_SETTINGS_MENU')} />
              </div>
            </div>
            <OptionsContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
