import React, { useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from '../OptionsMenu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT, QUERY_STATUS } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';
import {
  fetchAllSettings,
  getSettingsEntity,
  getSettingsStatus
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';

const OptionsSettings = () => {
  const gameInfo = useAppSelector(getGameInfo);
  const dispatch = useAppDispatch();

  const settingsData = useAppSelector(getSettingsEntity);
  const isLoading = useAppSelector(getSettingsStatus);

  const initialValues = {
    holdPriority: settingsData['HoldPrioritySetting']?.value,
    tryReactUI: settingsData['TryReactUI']?.value === '1',
    darkMode: settingsData['DarkMode']?.value === '1',
    skipAttackReactions: settingsData['SkipARWindow']?.value === '1',
    skipDefenseReactions: settingsData['SkipDRWindow']?.value === '1',
    skipNextDefenseReaction: settingsData['SkipNextDRWindow']?.value === '1',
    manualTargeting: settingsData['AutoTargetOpponent']?.value === '0',
    attackSkip: 'neverSkip', // options
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
            <input type="radio" name="holdPriority" value="autoPass" disabled />
            Auto-Pass Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="alwaysPass"
              disabled
            />
            Always Pass Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="alwaysHold"
              disabled
            />
            Always Hold Priority
          </label>
          <label className={styles.optionLabel}>
            <input
              type="radio"
              name="holdPriority"
              value="holdAllOpp"
              disabled
            />
            Hold Priority for all Opponent Actions
          </label>
          <label className={styles.optionLabel}>
            <input
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
            <input type="checkbox" name="skipAttackReactions" disabled />
            Skip Attack Reactions
          </label>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="skipDefenseReactions" disabled />
            Skip Defense Reactions
          </label>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="manualTargeting" disabled />
            Manual Targeting
          </label>
        </fieldset>
        <fieldset>
          <legend>
            <strong>Attack Shortcut Threshold</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input type="radio" name="attackSkip" value="neverSkip" disabled />
            Never Skip Attacks
          </label>
          <label className={styles.optionLabel}>
            <input type="radio" name="attackSkip" value="skipOnes" disabled />
            Skip 1 Power Attacks
          </label>
          <label className={styles.optionLabel}>
            <input type="radio" name="attackSkip" value="skipAll" disabled />
            Skip All Attacks
          </label>
        </fieldset>
        <fieldset>
          <legend>Other Settings</legend>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="manualMode" disabled />
            Manual Mode
          </label>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="accessibilityMode" disabled />
            Accessibility Mode
          </label>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="mute" disabled />
            Mute
          </label>
          <label className={styles.optionLabel}>
            <input type="checkbox" name="disableChat" disabled />
            Disable Chat
          </label>
        </fieldset>
        <div className={styles.buttonColumn}>
          <button className={styles.buttonDiv} type="submit" disabled>
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
