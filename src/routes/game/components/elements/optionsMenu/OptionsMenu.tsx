import React from 'react';
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

const OptionsContent = () => {
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const gameURL = `http://fe.talishar.net/game/play/${gameID}`;

  const clickCloseOptionsHandler = () => {
    dispatch(closeOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.CLOSE_WINDOW, clickCloseOptionsHandler);

  const clickSubmitOptionsHandler = () => {
    // TODO: implement
    console.log('submitting options');
  };

  const clickConcedeGameHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.CONCEDE_GAME } }));
  };

  const clickPlayLegacyHandler = async (e: React.MouseEvent) => {
    e.preventDefault;
    await screenfull.exit();
    window.location.href = `https://talishar.net/game/NextTurn4.php?gameName=${gameID}&playerID=${playerID}`;
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

  const clickUndoButtonHandler = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
    clickCloseOptionsHandler();
  };

  const clickRevertToStartOfThisTurnHandler = () => {
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.REVERT_TO_PRIOR_TURN } })
    );
    clickCloseOptionsHandler();
  };

  const clickRevertToStartOfPreviousTurnHandler = () => {
    // TODO: implement
    console.log('revert to start of previous turn');
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
        <h3>Navigation</h3>
        <div className={styles.buttonColumn}>
          <button className={styles.buttonDiv} onClick={clickPlayLegacyHandler}>
            Play in Legacy Talishar Client
          </button>
          <button
            className={styles.buttonDiv}
            onClick={handleClickMainMenuButton}
          >
            Home Page
          </button>
          <button
            className={styles.buttonDiv}
            onClick={clickConcedeGameHandler}
          >
            Concede
          </button>
          <button className={styles.buttonDiv} onClick={clickReportBugHandler}>
            Report Bug
          </button>
          <button className={styles.buttonDiv} onClick={clickUndoButtonHandler}>
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
            disabled
          >
            Revert to Start of Previous Turn (inactive)
          </button>
        </div>
        <h3>Invite Spectators</h3>
        <div className={styles.buttonColumn}>
          <span>{gameURL}</span>
          <button
            style={{ marginTop: '0.5em' }}
            className={styles.buttonDiv}
            onClick={clickCopySpectateToClipboardHandler}
          >
            Copy Spectate Link
          </button>
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
              <h2 className={styles.title}>Main Options</h2>
              <h4>(priority settings can be adjusted here)</h4>
            </hgroup>
            <div
              className={styles.optionsMenuCloseIcon}
              onClick={closeOptions}
              data-testid="close-button"
            >
              <FaTimes title="close options menu" />
            </div>
          </div>
          <OptionsContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
