import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import screenfull from 'screenfull';
import { useNavigate } from 'react-router-dom';
import {
  closeOptionsMenu,
  getGameInfo,
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
import { CosmeticsSection } from './OptionsSettings/CosmeticsSection';
import { useGetCosmeticsQuery } from 'features/api/apiSlice';
import { useAppSelector as useAppSelectorOptions } from 'app/Hooks';
import { 
  getSettingsEntity,
  updateOptions,
  Setting
} from 'features/options/optionsSlice';
import styles2 from './OptionsSettings/OptionsSettings.module.css';

const OptionsContent = () => {
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const settingsData = useAppSelectorOptions(getSettingsEntity);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allowSpectator, setAllowSpectator] = useState(false);
  const { data } = useGetCosmeticsQuery(undefined);

  const gameURL = `http://talishar.net/game/play/${gameID}`;

  const initialValues = {
    cardBack: String(settingsData['CardBack']?.value ?? '0'),
    playMat: String(settingsData['Playmat']?.value ?? '0'),
  };

  const handleSettingsChange = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const clickCloseOptionsHandler = () => {
    dispatch(closeOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, clickCloseOptionsHandler);

  const clickConcedeGameHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.CONCEDE_GAME } }));
  };

  // going to main menu means you concede the game
  const handleClickMainMenuButton = async (e: React.MouseEvent) => {
    e.preventDefault;
    clickConcedeGameHandler();
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

  const clickCopySpectateToClipboardHandler = () => {
    navigator.clipboard.writeText(gameURL);
  };

  return (
    <div className={styles.optionsContentContainer}>
      <div className={styles.column}>
        <OptionsSettings />
      </div>
      <div className={styles.column}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span>General</span>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.buttonColumn}>
              <button
                className={styles.buttonDiv}
                onClick={handleClickMainMenuButton}
              >
                Homepage
              </button>
              {playerID !== 3 && ( // If not a spectator then can change options
                <>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickConcedeGameHandler}
                  >
                    Concede
                  </button>

                  <button
                    className={styles.buttonDiv}
                    onClick={clickReportBugHandler}
                  >
                    Report Bug
                  </button>

                  <button
                    className={styles.buttonDiv}
                    onClick={clickReportPlayerHandler}
                  >
                    Report Player
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span>Gamestate Correction</span>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.buttonColumn}>
              {playerID !== 3 && ( // If not a spectator then can change options
                <>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickUndoButtonHandler}
                  >
                    Undo
                  </button>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickRevertToStartOfThisTurnHandler}
                  >
                    Revert to Start of This turn
                  </button>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickRevertToStartOfPreviousTurnHandler}
                  >
                    Revert to Start of Previous Turn
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span>Invite Spectators</span>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.buttonColumn}>
              {!allowSpectator ? (
                <>
                  <button
                    className={styles.buttonDiv}
                    onClick={handleAllowSpectators}
                  >
                    Allow Spectators for Private Match
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.buttonDiv}
                    onClick={clickCopySpectateToClipboardHandler}
                  >
                    Copy Spectate Link
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
          <CosmeticsSection
            data={data}
            selectedCardBack={initialValues.cardBack}
            selectedPlaymat={initialValues.playMat}
            onSettingsChange={handleSettingsChange}
          />
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

  const closeOptions = () => {
    dispatch(closeOptionsMenu());
  };

  return (
    <AnimatePresence>
      {optionsMenu?.active && showModal && (
        <motion.div
          className={styles.optionsContainer}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          key="optionsMenuPopup"
        >
          <div className={styles.optionsTitleContainer}>
            <hgroup className={styles.optionsTitle}>
              <h2 className={styles.title}>Settings Menu</h2>
              <h4></h4>
            </hgroup>
            <div
              className={styles.optionsMenuCloseIcon}
              onClick={closeOptions}
              data-testid="close-button"
            >
              <FaTimes title="Close Settings Menu" />
            </div>
          </div>
          <OptionsContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
