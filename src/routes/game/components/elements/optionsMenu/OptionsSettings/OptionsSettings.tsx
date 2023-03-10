import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from '../OptionsMenu.module.css';
import {
  fetchAllSettings,
  getSettingsEntity,
  getSettingsStatus,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import * as optConst from 'features/options/constants';
import HeroZone from 'routes/game/components/zones/heroZone/HeroZone';

const OptionsSettings = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const settingsData = useAppSelector(getSettingsEntity);
  const isLoading = useAppSelector(getSettingsStatus);
  const dispatch = useAppDispatch();

  // fetch all settings when options is loaded
  useEffect(() => {
    dispatch(fetchAllSettings({ game: gameInfo }));
  }, []);

  const handleSettingsChange = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const initialValues = {
    holdPriority: settingsData['HoldPrioritySetting']?.value,
    tryReactUI: settingsData['TryReactUI']?.value === '1',
    darkMode: settingsData['DarkMode']?.value === '1',
    skipAttackReactions: settingsData['SkipARWindow']?.value === '1',
    skipDefenseReactions: settingsData['SkipDRWindow']?.value === '1',
    skipNextDefenseReaction: settingsData['SkipNextDRWindow']?.value === '1',
    manualTargeting: settingsData['AutoTargetOpponent']?.value === '0', // reversed!
    shortcutAttackThreshold:
      settingsData[optConst.SHORTCUT_ATTACK_THRESHOLD]?.value,
    manualMode: settingsData['ManualMode']?.value === '1',
    accessibilityMode: settingsData['ColorblindMode']?.value === '1',
    mute: settingsData['MuteSound']?.value === '1',
    disableChat: settingsData['MuteChat']?.value === '1',
    disableStats: settingsData['DisableStats']?.value === '1',
    casterMode: settingsData['IsCasterMode']?.value === '1',
    streamerMode: settingsData['IsStreamerMode']?.value === '1'
  };

  return (
    <div>
      <div className={styles.leftColumn}>
        <h3 className={styles.alarm}>OPTIONS ARE INACTIVE</h3>
        <h5>Disclaimer:</h5>
        <p>
          Talishar is an open-source, fan-made platform not associated with LSS.
          It may not be a completely accurate representation of the Rules as
          Written. If you have questions about interactions or rulings, please
          contact the judge community for clarification.
        </p>
        <fieldset>
          <legend>
            <strong>Priority Settings:</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="autoPass"
              checked={
                Number(initialValues.holdPriority) ===
                optConst.HOLD_PRIORITY_ENUM.AUTO
              }
              onClick={() =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: optConst.HOLD_PRIORITY_ENUM.AUTO
                })
              }
            />
            Auto-Pass Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="alwaysPass"
              checked={
                Number(initialValues.holdPriority) ===
                optConst.HOLD_PRIORITY_ENUM.ALWAYS_PASS
              }
              onClick={() =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: optConst.HOLD_PRIORITY_ENUM.ALWAYS_PASS
                })
              }
            />
            Always Pass Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="alwaysHold"
              checked={
                Number(initialValues.holdPriority) ===
                optConst.HOLD_PRIORITY_ENUM.ALWAYS_HOLD
              }
              onClick={() =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: optConst.HOLD_PRIORITY_ENUM.ALWAYS_HOLD
                })
              }
            />
            Always Hold Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="holdAllOpp"
              checked={
                Number(initialValues.holdPriority) ===
                optConst.HOLD_PRIORITY_ENUM.HOLD_ALL_OPPONENT
              }
              onClick={() =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: optConst.HOLD_PRIORITY_ENUM.HOLD_ALL_OPPONENT
                })
              }
            />
            Hold Priority for all Opponent Actions
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="holdOppAtt"
              checked={
                Number(initialValues.holdPriority) ===
                optConst.HOLD_PRIORITY_ENUM.HOLD_ALL_OPPONENT_ATTACKS
              }
              onClick={() =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: optConst.HOLD_PRIORITY_ENUM.HOLD_ALL_OPPONENT_ATTACKS
                })
              }
            />
            Hold Priority for all Opponent Attacks
          </label>
        </fieldset>
        <fieldset>
          <legend>
            <strong>Skip overrides</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="skipAttackReactions"
              checked={initialValues.skipAttackReactions}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.SKIP_AR_WINDOW,
                  value: initialValues.skipAttackReactions ? '0' : '1'
                })
              }
            />
            Skip Attack Reactions
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="skipDefenseReactions"
              checked={initialValues.skipDefenseReactions}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.SKIP_DR_WINDOW,
                  value: initialValues.skipDefenseReactions ? '0' : '1'
                })
              }
            />
            Skip Defense Reactions
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="manualTargeting"
              checked={initialValues.manualTargeting}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.AUTO_TARGET_OPPONENT,
                  value: initialValues.manualTargeting ? '1' : '0' // reversed!
                })
              }
            />
            Manual Targeting
          </label>
        </fieldset>
        <fieldset>
          <legend>
            <strong>Attack Shortcut Threshold</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="attackSkip"
              value="neverSkip"
              checked={Number(initialValues.shortcutAttackThreshold) === 0}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.SHORTCUT_ATTACK_THRESHOLD,
                  value: 0
                })
              }
            />
            Never Skip Attacks
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="attackSkip"
              value="skipOnes"
              checked={Number(initialValues.shortcutAttackThreshold) === 1}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.SHORTCUT_ATTACK_THRESHOLD,
                  value: 1
                })
              }
            />
            Skip 1 Power Attacks
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="attackSkip"
              value="skipAll"
              checked={Number(initialValues.shortcutAttackThreshold) >= 2}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.SHORTCUT_ATTACK_THRESHOLD,
                  value: 99
                })
              }
            />
            Skip All Attacks
          </label>
        </fieldset>
        <fieldset>
          <legend>Other Settings</legend>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="manualMode"
              disabled
              area-disabled="true"
              checked={initialValues.manualMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_MODE,
                  value: initialValues.manualMode ? '0' : '1'
                })
              }
            />
            Manual Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="accessibilityMode"
              disabled
              area-disabled="true"
              checked={initialValues.accessibilityMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.COLORBLIND_MODE,
                  value: initialValues.accessibilityMode ? '0' : '1'
                })
              }
            />
            Accessibility Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="mute"
              checked={initialValues.mute}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.MUTE_SOUND,
                  value: initialValues.mute ? '0' : '1'
                })
              }
            />
            Mute
          </label>
          <label className={styles.optionLabel}>
            <input
              type="checkbox"
              name="disableChat"
              checked={initialValues.disableChat}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.MUTE_CHAT,
                  value: initialValues.disableChat ? '0' : '1'
                })
              }
            />
            Disable Chat
          </label>
        </fieldset>
        <div className={styles.buttonColumn}>
          <button className={styles.buttonDiv} type="submit">
            Submit Options (inactive)
          </button>
        </div>
      </div>
      <p>
        Talishar is in no way affiliated with Legend Story Studios. Legend Story
        Studios®, Flesh and Blood™, and set names are trademarks of Legend Story
        Studios. Flesh and Blood characters, cards, logos, and art are property
        of Legend Story Studios. Card Images © Legend Story Studios.
      </p>
    </div>
  );
};

export default OptionsSettings;
