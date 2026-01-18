import { useGetCosmeticsQuery } from 'features/api/apiSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import { CosmeticsSection } from '../../game/components/elements/optionsMenu/OptionsSettings/CosmeticsSection';
import {
  CheckboxSetting,
  RadioGroup,
  Fieldset
} from '../../game/components/elements/optionsMenu/OptionsSettings/FormComponents';
import { VisualSlider, VisualPreset } from '../../game/components/elements/optionsMenu/OptionsSettings/VisualSettings';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  fetchAllSettings,
  getSettingsEntity,
  getSettingsStatus,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import * as optConst from 'features/options/constants';
import styles from './settings.module.css';
import ThemeToggle from 'themes/ThemeToggle';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';

const SettingsPage = () => {
  usePageTitle('Settings');
  const settingsData = useAppSelector(getSettingsEntity);
  const isLoading = useAppSelector(getSettingsStatus);
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const { data } = useGetCosmeticsQuery(undefined);
  const [cookies, setCookie] = useCookies([
    'experimental',
    'cardSize',
    'playmatIntensity',
    'transparencyIntensity',
    'hoverImageSize'
  ]);

  // Dummy game object for settings page (not in an active game)
  const profileGameInfo = { playerID: 0, gameID: 0, authKey: '', isPrivateLobby: false };

  // fetch all settings when component is loaded
  useEffect(() => {
    // Load settings from backend for settings context - only on mount
    dispatch(fetchAllSettings({ game: profileGameInfo }));
  }, [dispatch]); // Only depend on dispatch to run once on mount

  const handleSettingsChange = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: profileGameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const initialValues = {
    holdPriority: settingsData['HoldPrioritySetting']?.value ?? optConst.HOLD_PRIORITY_ENUM.AUTO,
    tryReactUI: settingsData['TryReactUI']?.value === '1',
    darkMode: settingsData['DarkMode']?.value === '1',
    skipAttackReactions: settingsData['SkipARWindow']?.value === '1',
    skipDefenseReactions: settingsData['SkipDRWindow']?.value === '1',
    skipNextDefenseReaction: settingsData['SkipNextDRWindow']?.value === '1',
    manualTargeting: settingsData['AutoTargetOpponent']?.value === '0', // reversed!
    shortcutAttackThreshold:
      settingsData[optConst.SHORTCUT_ATTACK_THRESHOLD]?.value ?? 0,
    manualMode: String(settingsData['ManualMode']?.value) === '1',
    accessibilityMode: String(settingsData['ColorblindMode']?.value) === '1',
    mute: String(settingsData['MuteSound']?.value) === '1',
    disableChat: String(settingsData['MuteChat']?.value) === '1',
    disableStats: String(settingsData['DisableStats']?.value) === '1',
    disableAltArts: String(settingsData['DisableAltArts']?.value) === '1',
    casterMode: String(settingsData['IsCasterMode']?.value) === '1',
    streamerMode: String(settingsData['IsStreamerMode']?.value) === '1',
    alwaysAllowUndo: String(settingsData['AlwaysAllowUndo']?.value) === '1',
    manualTunic: String(settingsData['ManualTunic']?.value) === '1',
    cardBack: String(settingsData['CardBack']?.value ?? '0'),
    playMat: String(settingsData['Playmat']?.value ?? '0'),
    disableFabInsights: String(settingsData['DisableFabInsights']?.value) === '1',
    disableHeroIntro: String(settingsData['DisableHeroIntro']?.value) === '1',
    mirroredBoardLayout: settingsData?.[optConst.MIRRORED_BOARD_LAYOUT]?.value === '1',
    mirroredPlayerBoardLayout: settingsData?.[optConst.MIRRORED_PLAYER_BOARD_LAYOUT]?.value === '1',
    alwaysShowCounters: String(settingsData[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1',
  };

  const priorityOptions = [
    {
      value: 'autoPass',
      label: 'Auto-Pass Priority',
      enumValue: optConst.HOLD_PRIORITY_ENUM.AUTO
    },
    {
      value: 'alwaysPass',
      label: 'Always Pass Priority',
      enumValue: optConst.HOLD_PRIORITY_ENUM.ALWAYS_PASS
    },
    {
      value: 'alwaysHold',
      label: 'Always Hold Priority',
      enumValue: optConst.HOLD_PRIORITY_ENUM.ALWAYS_HOLD
    }
  ];

  const attackShortcutOptions = [
    { value: 'neverSkip', label: 'Never Skip Attacks', enumValue: 0 },
    { value: 'skipOnes', label: 'Skip 1 Power Attacks', enumValue: 1 },
    { value: 'skipAll', label: 'Skip All Attacks', enumValue: 99 }
  ];

  const transparencyPresets = [
    { value: 0.75, label: '75%' },
    { value: 0.85, label: '85%' },
    { value: 0.90, label: '90%' },
    { value: 0.95, label: '95%' },
    { value: 1.0, label: '100%' }
  ];

  return (
    <div className={styles.wideContainer}>
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.twoColumnLayout}>
        <div className={styles.settingsColumn}>
          <h3 className={styles.title}>Game Settings</h3>
          
          <Fieldset legend="Priority Settings">
            <RadioGroup
              name="holdPriority"
              options={priorityOptions}
              checked={Number(initialValues.holdPriority)}
              onChange={(value) =>
                handleSettingsChange({
                  name: optConst.HOLD_PRIORITY_SETTING,
                  value: value
                })
              }
            />
          </Fieldset>

          <Fieldset legend="Skip Overrides">
            <CheckboxSetting
              name="skipAttackReactions"
              label="Skip Attack Reactions"
              checked={initialValues.skipAttackReactions}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.SKIP_AR_WINDOW,
                  value: initialValues.skipAttackReactions ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="skipDefenseReactions"
              label="Skip Defense Reactions"
              checked={initialValues.skipDefenseReactions}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.SKIP_DR_WINDOW,
                  value: initialValues.skipDefenseReactions ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="manualTargeting"
              label="Manual Targeting"
              checked={initialValues.manualTargeting}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.AUTO_TARGET_OPPONENT,
                  value: initialValues.manualTargeting ? '1' : '0'
                })
              }
            />
          </Fieldset>

          <Fieldset legend="Attack Shortcut Threshold">
            <RadioGroup
              name="attackSkip"
              options={attackShortcutOptions}
              checked={Number(initialValues.shortcutAttackThreshold)}
              onChange={(value) =>
                handleSettingsChange({
                  name: optConst.SHORTCUT_ATTACK_THRESHOLD,
                  value: value
                })
              }
            />
          </Fieldset>

          <Fieldset legend="Modes">
            <CheckboxSetting
              name="streamerMode"
              label="Streamer Mode"
              checked={initialValues.streamerMode}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.IS_STREAMER_MODE,
                  value: initialValues.streamerMode ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
            <CheckboxSetting
              name="casterMode"
              label="Caster Mode"
              tooltip="Show both players hands for casting purposes, only if both players have the setting enabled."
              checked={initialValues.casterMode}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.IS_CASTER_MODE,
                  value: initialValues.casterMode ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
            <CheckboxSetting
              name="manualMode"
              label="Manual Mode"
              checked={initialValues.manualMode}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_MODE,
                  value: initialValues.manualMode ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
            <CheckboxSetting
              name="manualTunic"
              label="Manual Tunic Mode"
              checked={initialValues.manualTunic}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_TUNIC,
                  value: initialValues.manualTunic ? '0' : '1'
                })
              }
            />
          </Fieldset>

          <Fieldset legend="Accessibility & Other">
            <CheckboxSetting
              name="alwaysAllowUndo"
              label="Always Allow Undo"
              checked={initialValues.alwaysAllowUndo}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.ALWAYS_ALLOW_UNDO,
                  value: initialValues.alwaysAllowUndo ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
            <CheckboxSetting
              name="accessibilityMode"
              label="Color Accessibility Mode"
              checked={initialValues.accessibilityMode}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.COLORBLIND_MODE,
                  value: initialValues.accessibilityMode ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
            <CheckboxSetting
              name="mute"
              label="Mute Game Sounds"
              checked={initialValues.mute}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MUTE_SOUND,
                  value: initialValues.mute ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="disableStats"
              label="Disable Fabrary Stats"
              checked={initialValues.disableStats}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_STATS,
                  value: initialValues.disableStats ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="disableFabInsights"
              label="Disable Global Stats"
              tooltip="Disables sending game statistics to FaB Insights and FaBlazing for stats tracking."
              checked={initialValues.disableFabInsights}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_FABINSIGHTS,
                  value: initialValues.disableFabInsights ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="disableAltArts"
              label="Disable Alternate Arts"
              checked={initialValues.disableAltArts}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_ALT_ARTS,
                  value: initialValues.disableAltArts ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="disableHeroIntro"
              label="Disable Hero Intro Animation"
              checked={initialValues.disableHeroIntro}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.DISABLE_HERO_INTRO,
                  value: initialValues.disableHeroIntro ? '0' : '1'
                })
              }
            />
          </Fieldset>
        </div>

        <div className={styles.settingsColumn}>
          <h3 className={styles.title}>Visual Settings</h3>
          
          <Fieldset legend="Cards Language">
            <LanguageSelector />
          </Fieldset>

          <Fieldset legend="Theme">
            <ThemeToggle />
          </Fieldset>
          
          <Fieldset legend="Visual Settings">

            <CheckboxSetting
              name="mirroredOpponent"
              label="Mirror Opponent Board"
              checked={initialValues.mirroredBoardLayout}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MIRRORED_BOARD_LAYOUT,
                  value: initialValues.mirroredBoardLayout ? '0' : '1'
                })
              }
            />

            <CheckboxSetting
              name="mirroredPlayer"
              label="Mirror Player Board"
              checked={initialValues.mirroredPlayerBoardLayout}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MIRRORED_PLAYER_BOARD_LAYOUT,
                  value: initialValues.mirroredPlayerBoardLayout ? '0' : '1'
                })
              }
            />

            <CheckboxSetting
              name="alwaysShowCounters"
              label="Always Show Counters on Cards"
              checked={initialValues.alwaysShowCounters}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.ALWAYS_SHOW_COUNTERS,
                  value: initialValues.alwaysShowCounters ? '0' : '1'
                })
              }
            />

            <VisualSlider
              label="Card Size"
              value={cookies.cardSize ?? 1}
              min={isMobile ? 100 : 50}
              max={125}
              onChange={(value) => setCookie('cardSize', value)}
            />

            <VisualSlider
              label="Card Preview Size"
              value={cookies.hoverImageSize ?? 1}
              min={75}
              max={125}
              onChange={(value) => setCookie('hoverImageSize', value)}
            />

            <VisualPreset
              label="Transparency"
              currentValue={cookies.transparencyIntensity ?? 1}
              presets={transparencyPresets}
              onChange={(value) => setCookie('transparencyIntensity', value)}
            />

            <VisualSlider
              label="Playmat Intensity"
              value={cookies.playmatIntensity ?? 0.65}
              min={10}
              max={100}
              onChange={(value) => setCookie('playmatIntensity', value)}
            />
          </Fieldset>

          <CosmeticsSection
            data={data}
            selectedCardBack={initialValues.cardBack}
            selectedPlaymat={initialValues.playMat}
            onSettingsChange={handleSettingsChange}
          />

          <p className={styles.disclaimer}>
            Talishar is in no way affiliated with Legend Story Studios. Legend Story
            Studios®, Flesh and Blood™, and set names are trademarks of Legend Story
            Studios. Flesh and Blood characters, cards, logos, and art are property
            of <a href="https://legendstory.com/" target="_blank" rel="noreferrer">Legend Story Studios</a>. 
            Card Images © Legend Story Studios
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
