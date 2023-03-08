import { Field, Form, Formik } from 'formik';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import screenfull from 'screenfull';
import { useNavigate } from 'react-router-dom';
import { closeOptionsMenu, submitButton } from 'features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './OptionsMenu.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { DEFAULT_SHORTCUTS, PLAYER_OPTIONS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';

const OptionsContent = () => {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    lastPlayed: null,
    popupType: PLAYER_OPTIONS
  });

  const gameURL = `http://fe.talishar.net/game/play/${gameInfo.gameID}`;

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
    window.location.href = `https://talishar.net/game/NextTurn4.php?gameName=${gameInfo.gameID}&playerID=${gameInfo.playerID}`;
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

  if (isError) {
    return <div>Oh noes an error!</div>;
  }

  const optionsObj = data?.Settings?.reduce((output: any, setting: any) => {
    output[setting.name] = setting.value;
    return output;
  }, {});

  //   {
  //   "HoldPrioritySetting": "0",
  //   "TryReactUI": "1",
  //   "DarkMode": "0",
  //   "ManualMode": "0",
  //   "SkipARWindow": "0",
  //   "SkipDRWindow": "0",
  //   "SkipNextDRWindow": "0",
  //   "AutoTargetOpponent": "1",
  //   "ColorblindMode": "0",
  //   "ShortcutAttackThreshold": "0",
  //   "EnableDynamicScaling": "0", // not needed
  //   "MuteSound": "0",
  //   "CardBack": "0",
  //   "IsPatron": "0",
  //   "MuteChat": "0",
  //   "DisableStats": "0",
  //   "IsCasterMode": "0",
  //   "IsStreamerMode": "0"
  // }

  const initialValues = {
    holdPriority: optionsObj?.HoldPrioritySetting,
    tryReactUI: optionsObj?.TryReactUI === '1',
    darkMode: optionsObj?.DarkMode === '1',
    skipAttackReactions: optionsObj?.SkipARWindow === '1',
    skipDefenseReactions: optionsObj?.SkipDRWindow === '1',
    skipNextDefenseReaction: optionsObj?.SkipNextDRWindow === '1',
    manualTargeting: optionsObj?.AutoTargetOpponent === '0',
    attackSkip: 'neverSkip', // options
    manualMode: optionsObj?.ManualMode === '1',
    accessibilityMode: optionsObj?.ColorblindMode === '1',
    mute: optionsObj?.MuteSound === '1',
    disableChat: optionsObj?.MuteChat === '1',
    disableStats: optionsObj?.DisableStats === '1',
    casterMode: optionsObj?.IsCasterMode === '1',
    streamerMode: optionsObj?.IsStreamerMode === '1'
  };

  return (
    <div className={styles.optionsContentContainer}>
      <div className={styles.column}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={clickSubmitOptionsHandler}
        >
          {isLoading ? (
            <h3 aria-busy>Loading...</h3>
          ) : (
            ({ values }) => (
              <div>
                <Form>
                  <div className={styles.leftColumn}>
                    <h3 className={styles.alarm}>OPTIONS ARE INACTIVE</h3>
                    <h5>Disclaimer:</h5>
                    <p>
                      Talishar is an open-source, fan-made platform not
                      associated with LSS. It may not be a completely accurate
                      representation of the Rules as Written. If you have
                      questions about interactions or rulings, please contact
                      the judge community for clarification.
                    </p>
                    <fieldset>
                      <legend>
                        <strong>Priority Settings:</strong>
                      </legend>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="holdPriority"
                          value="autoPass"
                          disabled
                        />
                        Auto-Pass Priority
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="holdPriority"
                          value="alwaysPass"
                          disabled
                        />
                        Always Pass Priority
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="holdPriority"
                          value="alwaysHold"
                          disabled
                        />
                        Always Hold Priority
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="holdPriority"
                          value="holdAllOpp"
                          disabled
                        />
                        Hold Priority for all Opponent Actions
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="holdPriority"
                          value="holdOppAtt"
                          disabled
                        />
                        Hold Priority for all Opponent Attacks
                      </label>
                    </fieldset>
                    <fieldset>
                      <legend>
                        <strong>Skip overrides</strong>
                      </legend>
                      <label className={styles.optionLabel}>
                        <Field
                          type="checkbox"
                          name="skipAttackReactions"
                          disabled
                        />
                        Skip Attack Reactions
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="checkbox"
                          name="skipDefenseReactions"
                          disabled
                        />
                        Skip Defense Reactions
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="checkbox"
                          name="manualTargeting"
                          disabled
                        />
                        Manual Targeting
                      </label>
                    </fieldset>
                    <fieldset>
                      <legend>
                        <strong>Attack Shortcut Threshold</strong>
                      </legend>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="attackSkip"
                          value="neverSkip"
                          disabled
                        />
                        Never Skip Attacks
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="attackSkip"
                          value="skipOnes"
                          disabled
                        />
                        Skip 1 Power Attacks
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="radio"
                          name="attackSkip"
                          value="skipAll"
                          disabled
                        />
                        Skip All Attacks
                      </label>
                    </fieldset>
                    <fieldset>
                      <legend>Other Settings</legend>
                      <label className={styles.optionLabel}>
                        <Field type="checkbox" name="manualMode" disabled />
                        Manual Mode
                      </label>
                      <label className={styles.optionLabel}>
                        <Field
                          type="checkbox"
                          name="accessibilityMode"
                          disabled
                        />
                        Accessibility Mode
                      </label>
                      <label className={styles.optionLabel}>
                        <Field type="checkbox" name="mute" disabled />
                        Mute
                      </label>
                      <label className={styles.optionLabel}>
                        <Field type="checkbox" name="disableChat" disabled />
                        Disable Chat
                      </label>
                    </fieldset>
                    <div className={styles.buttonColumn}>
                      <button
                        className={styles.buttonDiv}
                        type="submit"
                        disabled
                      >
                        Submit Options (inactive)
                      </button>
                    </div>
                  </div>
                </Form>
                <p>
                  Talishar is in no way affiliated with Legend Story Studios.
                  Legend Story Studios®, Flesh and Blood™, and set names are
                  trademarks of Legend Story Studios. Flesh and Blood
                  characters, cards, logos, and art are property of Legend Story
                  Studios. Card Images © Legend Story Studios.
                </p>
              </div>
            )
          )}
        </Formik>
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
