import { Field, Form, Formik } from 'formik';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import {
  closeOptionsMenu,
  submitButton
} from '../../../features/game/GameSlice';
import { FaTimes } from 'react-icons/fa';
import styles from './OptionsMenu.module.css';
import { useGetPopUpContentQuery } from '../../../features/api/apiSlice';
import { PLAYER_OPTIONS } from '../../../constants';

const OptionsContent = () => {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const dispatch = useAppDispatch();

  const { isLoading, isError, data } = useGetPopUpContentQuery({
    ...gameInfo,
    lastPlayed: null,
    popupType: PLAYER_OPTIONS
  });

  const gameURL = `http://fe.talishar.net/?gameName=${gameInfo.gameID}&playerID=3`;

  const closeOptions = () => {
    dispatch(closeOptionsMenu());
  };

  const submitOptions = () => {
    // TODO: implement
    console.log('submitting options');
  };

  const concedeGame = () => {
    // TODO: implement
    console.log('coneding game placeholder');
  };

  const mainMenu = () => {
    // TODO: implement
    console.log('going to main menu');
  };

  const reportBug = () => {
    dispatch(submitButton({ button: { mode: 100003 } })); // 100003 - report bug
    closeOptions();
  };

  const undoButtonHandler = () => {
    dispatch(submitButton({ button: { mode: 10000 } })); // 10000 - undo
    closeOptions();
  };

  const revertToStartOfThisTurn = () => {
    // TODO: implement
    console.log('revert to start of this turn');
  };

  const revertToStartOfPreviousTurn = () => {
    // TODO: implement
    console.log('revert to start of previous turn');
  };

  const copySpectateToClipboard = () => {
    navigator.clipboard.writeText(gameURL);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
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
          onSubmit={submitOptions}
        >
          {({ values }) => (
            <Form>
              <div>
                <h3>Priority Settings:</h3>
                <div className={styles.radioContainer}>
                  <label className={styles.optionLabel}>
                    <Field type="radio" name="holdPriority" value="autoPass" />
                    Auto-Pass Priority
                  </label>
                  <label className={styles.optionLabel}>
                    <Field
                      type="radio"
                      name="holdPriority"
                      value="alwaysPass"
                    />
                    Always Pass Priority
                  </label>
                  <label className={styles.optionLabel}>
                    <Field
                      type="radio"
                      name="holdPriority"
                      value="alwaysHold"
                    />
                    Always Hold Priority
                  </label>
                  <label className={styles.optionLabel}>
                    <Field
                      type="radio"
                      name="holdPriority"
                      value="holdAllOpp"
                    />
                    Hold Priority for all Opponent Actions
                  </label>
                  <label className={styles.optionLabel}>
                    <Field
                      type="radio"
                      name="holdPriority"
                      value="holdOppAtt"
                    />
                    Hold Priority for all Opponent Attacks
                  </label>
                </div>
                <h3>Skip overrides</h3>
                <div className={styles.radioContainer}>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="skipAttackReactions" />
                    Skip Attack Reactions
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="skipDefenseReactions" />
                    Skip Defense Reactions
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="manualTargeting" />
                    Manual Targeting
                  </label>
                </div>
                <h3>Attack Shortcut Threshold</h3>
                <div className={styles.radioContainer}>
                  <label className={styles.optionLabel}>
                    <Field type="radio" name="attackSkip" value="neverSkip" />
                    Never Skip Attacks
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="radio" name="attackSkip" value="skipOnes" />
                    Skip 1 Power Attacks
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="radio" name="attackSkip" value="skipAll" />
                    Skip All Attacks
                  </label>
                </div>
                <div className={styles.radioContainer}>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="manualMode" />
                    Manual Mode
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="accessibilityMode" />
                    Accessibility Mode
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="mute" />
                    Mute
                  </label>
                  <label className={styles.optionLabel}>
                    <Field type="checkbox" name="disableChat" />
                    Manual Mode
                  </label>
                </div>
                <button className={styles.buttonDiv} type="submit">
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <div className={styles.column}>
        <h3>Navigation</h3>
        <div className={styles.rightColumn}>
          <button className={styles.buttonDiv} onClick={mainMenu}>
            Home page
          </button>
          <button className={styles.buttonDiv} onClick={concedeGame}>
            Concede
          </button>
          <button className={styles.buttonDiv} onClick={reportBug}>
            Report Bug
          </button>
          <button className={styles.buttonDiv} onClick={undoButtonHandler}>
            Undo
          </button>
          <button
            className={styles.buttonDiv}
            onClick={revertToStartOfThisTurn}
          >
            Revert to Start of This turn
          </button>
          <button
            className={styles.buttonDiv}
            onClick={revertToStartOfPreviousTurn}
          >
            Revert to Start of Previous Turn
          </button>
        </div>
        <h3>Invite your friends to spectate</h3>
        <div>
          {gameURL}
          <button
            className={styles.buttonDiv}
            onClick={copySpectateToClipboard}
          >
            Copy Spectate Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OptionsOverlay() {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();

  if (
    optionsMenu === undefined ||
    optionsMenu.active === undefined ||
    optionsMenu.active == false
  ) {
    return null;
  }

  const closeOptions = () => {
    dispatch(closeOptionsMenu());
  };

  return (
    <div className={styles.optionsContainer}>
      <div className={styles.optionsTitleContainer}>
        <div className={styles.optionsTitle}>
          <h2 className={styles.title}>Main Options</h2>
          (priority settings can be adjusted here)
        </div>
        <div className={styles.optionsMenuCloseIcon} onClick={closeOptions}>
          <FaTimes title="close options menu" />
        </div>
      </div>
      <OptionsContent />
    </div>
  );
}
