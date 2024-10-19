import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from './OptionsSettings.module.css';
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
import CardDisplay from '../../cardDisplay/CardDisplay';
import {
  CARD_BACK,
  PLAYER_PLAYMATS,
  PLAYMATS
} from 'features/options/cardBacks';
import { useGetCosmeticsQuery } from 'features/api/apiSlice';
import CardPopUp from '../../cardPopUp/CardPopUp';
import CardImage from '../../cardImage/CardImage';
import classNames from 'classnames';
import { useCookies } from 'react-cookie';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';
import {
  CARD_SQUARES_PATH,
  DEFAULT_LANGUAGE,
  getCollectionCardImagePath
} from 'utils';

const OptionsSettings = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const settingsData = useAppSelector(getSettingsEntity);
  const isLoading = useAppSelector(getSettingsStatus);
  const dispatch = useAppDispatch();
  const [openCardBacks, setOpenCardBacks] = useState<boolean>(false);
  const { data } = useGetCosmeticsQuery(undefined);
  const [cookies, setCookie, removeCookie] = useCookies([
    'experimental',
    'cardSize',
    'playmatIntensity'
  ]);

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

  const handleCardBackOnClick = () => {
    setOpenCardBacks(true);
  };

  const closeCardBack = () => {
    setOpenCardBacks(false);
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
    disableAltArts: settingsData['DisableAltArts']?.value === '1',
    casterMode: settingsData['IsCasterMode']?.value === '1',
    streamerMode: settingsData['IsStreamerMode']?.value === '1',
    // Enum is BE: /Libraries/PlayerSettings.php - function GetCardBack($player)
    cardBack: String(settingsData['CardBack']?.value ?? '0'),
    playMat: String(settingsData['Playmat']?.value ?? '0'),
    alwaysAllowUndo: settingsData['AlwaysAllowUndo']?.value === '1'
  };

  return (
    <div>
      <div className={styles.leftColumn}>
        <fieldset>
          <legend>
            <strong>Language Selector:</strong>
          </legend>
          <div>
            <LanguageSelector />
          </div>
        </fieldset>
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
            <strong>Skip Overrides</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
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
              defaultChecked
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
              defaultChecked
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
          <legend>
            <strong>Other Settings</strong>
          </legend>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="manualMode"
              area-disabled="true"
              checked={initialValues.streamerMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.IS_STREAMER_MODE,
                  value: initialValues.streamerMode ? '0' : '1'
                })
              }
            />
            Enable Streamer Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="manualMode"
              area-disabled="true"
              checked={initialValues.casterMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.IS_CASTER_MODE,
                  value: initialValues.casterMode ? '0' : '1'
                })
              }
            />
            Enable Caster Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="manualMode"
              area-disabled="true"
              checked={initialValues.manualMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_MODE,
                  value: initialValues.manualMode ? '0' : '1'
                })
              }
            />
            Enable Manual Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="alwaysAllowUndo"
              area-disabled="true"
              checked={initialValues.alwaysAllowUndo}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.ALWAYS_ALLOW_UNDO,
                  value: initialValues.alwaysAllowUndo ? '0' : '1'
                })
              }
            />
            Always Allow Undo
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="accessibilityMode"
              area-disabled="true"
              checked={initialValues.accessibilityMode}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.COLORBLIND_MODE,
                  value: initialValues.accessibilityMode ? '0' : '1'
                })
              }
            />
            Enable Accessibility Mode
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
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
            Mute Game Sounds
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
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
            Disable Chat (moreso)
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="disableStats"
              checked={initialValues.disableStats}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_STATS,
                  value: initialValues.disableStats ? '0' : '1'
                })
              }
            />
            Disable Stats
          </label>
          <label className={styles.optionLabel}>
            <input
              defaultChecked
              type="checkbox"
              name="disableAltArts"
              checked={initialValues.disableAltArts}
              onClick={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_ALT_ARTS,
                  value: initialValues.disableAltArts ? '0' : '1'
                })
              }
            />
            Disable Alt Arts
          </label>
        </fieldset>
        <label className={styles.cardBackTitle}>
          <strong>Card Back</strong>
          {!data?.cardBacks.length && (
            <p>Link your patreon on your profile page to unlock card backs</p>
          )}
          <div className={styles.cardBackListContainer}>
            {data?.cardBacks.map((cardBack) => {
              const cardClass = classNames(styles.cardBack, {
                [styles.selected]: initialValues.cardBack === cardBack.id
              });
              return (
                <CardPopUp
                  key={`cardBack${cardBack.id}`}
                  onClick={() =>
                    handleSettingsChange({
                      name: optConst.CARD_BACK,
                      value: cardBack.id
                    })
                  }
                  cardNumber={CARD_BACK[cardBack.id]}
                >
                  <CardImage
                    src={getCollectionCardImagePath({
                      path: CARD_SQUARES_PATH,
                      locale: DEFAULT_LANGUAGE,
                      cardNumber: CARD_BACK[cardBack.id]
                    })}
                    draggable={false}
                    className={cardClass}
                  />
                </CardPopUp>
              );
            })}
          </div>
        </label>
        <label className={styles.cardBackTitle}>
          <strong>Playmat</strong>
          {!!data?.playmats?.length ? (
            <select
              defaultValue={initialValues.playMat}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSettingsChange({
                  name: optConst.MY_PLAYMAT,
                  value: e.target.value
                })
              }
            >
              {data?.playmats?.map((playmatKey) => {
                return (
                  <option value={playmatKey.id}>
                    {PLAYMATS[playmatKey.id]}
                  </option>
                );
              })}
            </select>
          ) : (
            <p>Log in to customise your playmat</p>
          )}
        </label>
        {/* WARNING THIS MAY MAKE THE GAME MORE UNSTABLE. <br />
         <label className={styles.optionLabel}>
          <input
            type="checkbox"
            name="manualMode"
            area-disabled="true"
            checked={cookies.experimental === 'true'}
            onClick={() => {
              if (cookies.experimental) {
                removeCookie('experimental');
              } else {
                setCookie('experimental', 'true');
              }
            }}
          />
          Enable Experimental Features.
        </label>
        <p>
          We are always trying new things to improve Talishar if you try the
          experiment please give feedback in our discord.
        </p> */}
      </div>
      <hr />
      <>
        <fieldset>
          <label className={styles.optionLabel}>
            Card Size: {Math.floor(cookies.cardSize * 100)}%
            <input
              name="cardSize"
              type="range"
              min="25"
              max="100"
              defaultValue={(cookies.cardSize ?? 1) * 100}
              id="cardSize"
              onChange={(e) =>
                setCookie('cardSize', parseInt(e.target.value) / 100)
              }
            />
          </label>
          <label className={styles.optionLabel}>
            Playmat Intensity: {Math.floor(cookies.playmatIntensity * 100)}%
            <input
              name="playmatIntensity"
              type="range"
              min="10"
              max="100"
              defaultValue={(cookies.playmatIntensity ?? 0.65) * 100}
              id="cardSize"
              onChange={(e) =>
                setCookie('playmatIntensity', parseInt(e.target.value) / 100)
              }
            />
          </label>
        </fieldset>
      </>
      <p className={styles.disclaimer}>
      Talishar is in no way affiliated with Legend Story Studios. Legend Story
        Studios®, Flesh and Blood™, and set names are trademarks of Legend Story
        Studios. Flesh and Blood characters, cards, logos, and art are property
        of <a href="https://legendstory.com/" target="_blank">Legend Story Studios</a>. Card Images © Legend Story Studios
      </p>
    </div>
  );
};
export default OptionsSettings;
