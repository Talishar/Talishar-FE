import { useGetCosmeticsQuery } from 'features/api/apiSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import { useTranslation } from 'react-i18next';
import { CosmeticsSection } from '../../game/components/elements/optionsMenu/OptionsSettings/CosmeticsSection';
import {
  CheckboxSetting,
  RadioGroup,
  Fieldset
} from '../../game/components/elements/optionsMenu/OptionsSettings/FormComponents';
import { VisualSlider } from '../../game/components/elements/optionsMenu/OptionsSettings/VisualSettings';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  fetchAllSettings,
  getSettingsEntity,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import { useWindowWidth } from 'hooks/useWindowDimensions';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import * as optConst from 'features/options/constants';
import styles from './settings.module.css';
import ThemeToggle from 'themes/ThemeToggle';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';
import { useTheme } from 'themes/ThemeContext';
import { DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE } from '../../game/components/elements/gemSlider/equipmentGemPreference';

const SettingsPage = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.SETTINGS'));
  const { setTransparency } = useTheme();
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const { data } = useGetCosmeticsQuery(undefined);
  const [cookies, setCookie] = useCookies([
    'experimental',
    'cardSize',
    'playmatIntensity',
    'transparencyIntensity',
    'hoverImageSize',
    'disableParticles',
    'disableCardTilt',
    'tapToPreviewPlay',
    DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE
  ]);

  // Dummy game object for settings page (not in an active game)
  const profileGameInfo = {
    playerID: 0,
    gameID: 0,
    authKey: '',
    isPrivateLobby: false
  };

  // fetch all settings when component is loaded
  useEffect(() => {
    dispatch(fetchAllSettings({ game: profileGameInfo }));
  }, [dispatch]);

  const handleSettingsChange = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: profileGameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const initialValues = {
    holdPriority:
      settingsData['HoldPrioritySetting']?.value ??
      optConst.HOLD_PRIORITY_ENUM.AUTO,
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
    disableFabInsights:
      String(settingsData['DisableFabInsights']?.value) === '1',
    disableHeroIntro: String(settingsData['DisableHeroIntro']?.value) === '1',
    mirroredBoardLayout:
      String(settingsData?.[optConst.MIRRORED_BOARD_LAYOUT]?.value) === '1',
    mirroredPlayerBoardLayout:
      String(settingsData?.[optConst.MIRRORED_PLAYER_BOARD_LAYOUT]?.value) === '1',
    alwaysShowCounters:
      String(settingsData[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1',
    hideHandFromFriends:
      String(settingsData[optConst.HIDE_HAND_FROM_FRIENDS]?.value) === '1',
    hideGamesFromFriends:
      String(settingsData[optConst.HIDE_GAMES_FROM_FRIENDS]?.value) === '1',
    gemsOffByDefault:
      String(settingsData[optConst.GEMS_OFF_BY_DEFAULT]?.value) === '1'
  };

  const priorityOptions = [
    {
      value: 'autoPass',
      label: t('SETTINGS.PRIORITY_OPTIONS.AUTO_PASS'),
      enumValue: optConst.HOLD_PRIORITY_ENUM.AUTO
    },
    {
      value: 'alwaysPass',
      label: t('SETTINGS.PRIORITY_OPTIONS.ALWAYS_PASS'),
      enumValue: optConst.HOLD_PRIORITY_ENUM.ALWAYS_PASS
    },
    {
      value: 'alwaysHold',
      label: t('SETTINGS.PRIORITY_OPTIONS.ALWAYS_HOLD'),
      enumValue: optConst.HOLD_PRIORITY_ENUM.ALWAYS_HOLD
    }
  ];

  const attackShortcutOptions = [
    {
      value: 'neverSkip',
      label: t('SETTINGS.ATTACK_OPTIONS.NEVER_SKIP'),
      enumValue: 0
    },
    {
      value: 'skipOnes',
      label: t('SETTINGS.ATTACK_OPTIONS.SKIP_ONES'),
      enumValue: 1
    },
    {
      value: 'skipAll',
      label: t('SETTINGS.ATTACK_OPTIONS.SKIP_ALL'),
      enumValue: 99
    }
  ];

  return (
    <div className={`${styles.wideContainer} ${styles.flatSettingsPage}`}>
      <h1 className={styles.title}>{t('SETTINGS.PAGE_TITLE')}</h1>
      <div className={styles.twoColumnLayout}>
        <div className={styles.settingsColumn}>
          <h3 className={styles.title}>{t('SETTINGS.GAME_SETTINGS')}</h3>

          <Fieldset legend={t('SETTINGS.PRIORITY_SETTINGS')}>
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
            <CheckboxSetting
              name="gemsOffByDefault"
              label={t('SETTINGS.GEMS_OFF_BY_DEFAULT')}
              tooltip={t('SETTINGS.GEMS_OFF_BY_DEFAULT_TOOLTIP')}
              checked={initialValues.gemsOffByDefault}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.GEMS_OFF_BY_DEFAULT,
                  value: initialValues.gemsOffByDefault ? '0' : '1'
                })
              }
            />
          </Fieldset>

          <Fieldset
            legend={t('SETTINGS.SKIP_OVERRIDES')}
            tooltip={t('SETTINGS.SKIP_OVERRIDES_TOOLTIP')}
          >
            <CheckboxSetting
              name="skipAttackReactions"
              label={t('SETTINGS.SKIP_ATTACK_REACTIONS')}
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
              label={t('SETTINGS.SKIP_DEFENSE_REACTIONS')}
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
              label={t('SETTINGS.MANUAL_TARGETING')}
              checked={initialValues.manualTargeting}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.AUTO_TARGET_OPPONENT,
                  value: initialValues.manualTargeting ? '1' : '0'
                })
              }
            />
          </Fieldset>

          <Fieldset
            legend={t('SETTINGS.ATTACK_SHORTCUTS')}
            tooltip={t('SETTINGS.ATTACK_SHORTCUT_THRESHOLD_TOOLTIP')}
          >
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

          <Fieldset legend={t('SETTINGS.MODES')}>
            <CheckboxSetting
              name="streamerMode"
              label={t('SETTINGS.STREAMER_MODE')}
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
              label={t('SETTINGS.CASTER_MODE')}
              tooltip={t('SETTINGS.CASTER_MODE_TOOLTIP')}
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
              name="hideHandFromFriends"
              label={t('SETTINGS.HIDE_HAND_FROM_FRIENDS')}
              tooltip={t('SETTINGS.HIDE_HAND_FROM_FRIENDS_TOOLTIP')}
              checked={initialValues.hideHandFromFriends}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.HIDE_HAND_FROM_FRIENDS,
                  value: initialValues.hideHandFromFriends ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="hideGamesFromFriends"
              label={t('SETTINGS.HIDE_GAMES_FROM_FRIENDS')}
              tooltip={t('SETTINGS.HIDE_GAMES_FROM_FRIENDS_TOOLTIP')}
              checked={initialValues.hideGamesFromFriends}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.HIDE_GAMES_FROM_FRIENDS,
                  value: initialValues.hideGamesFromFriends ? '0' : '1'
                })
              }
            />
            <CheckboxSetting
              name="manualTunic"
              label={t('SETTINGS.MANUAL_TUNIC_MODE')}
              checked={initialValues.manualTunic}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_TUNIC,
                  value: initialValues.manualTunic ? '0' : '1'
                })
              }
            />
          </Fieldset>

          <Fieldset legend={t('SETTINGS.ACCESSIBILITY_OTHER')}>
            <CheckboxSetting
              name="alwaysAllowUndo"
              label={t('SETTINGS.ALWAYS_ALLOW_UNDO')}
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
              label={t('SETTINGS.COLOR_ACCESSIBILITY_MODE')}
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
              label={t('SETTINGS.MUTE_GAME_SOUNDS')}
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
              label={t('SETTINGS.DISABLE_FABRARY_STATS')}
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
              label={t('SETTINGS.DISABLE_GLOBAL_STATS')}
              tooltip={t('SETTINGS.DISABLE_GLOBAL_STATS_TOOLTIP')}
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
              label={t('SETTINGS.DISABLE_ALTERNATE_ARTS')}
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
              label={t('SETTINGS.DISABLE_HERO_INTRO_ANIMATION')}
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
          <h3 className={styles.title}>{t('SETTINGS.VISUAL_SETTINGS')}</h3>

          <Fieldset legend={t('SETTINGS.CARDS_LANGUAGE')}>
            <LanguageSelector />
          </Fieldset>

          <Fieldset legend={t('SETTINGS.THEME')}>
            <ThemeToggle />
          </Fieldset>

          <Fieldset legend={t('SETTINGS.VISUAL_SETTINGS')}>
            <CheckboxSetting
              name="mirroredOpponent"
              label={t('SETTINGS.MIRROR_OPPONENT_BOARD')}
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
              label={t('SETTINGS.MIRROR_PLAYER_BOARD')}
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
              label={t('SETTINGS.ALWAYS_SHOW_COUNTERS_ON_ZONES')}
              checked={initialValues.alwaysShowCounters}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.ALWAYS_SHOW_COUNTERS,
                  value: initialValues.alwaysShowCounters ? '0' : '1'
                })
              }
            />

            <CheckboxSetting
              name="disableParticles"
              label={t('SETTINGS.DISABLE_PARTICLE_EFFECTS')}
              checked={cookies.disableParticles === 'true'}
              onChange={() =>
                setCookie(
                  'disableParticles',
                  cookies.disableParticles === 'true' ? 'false' : 'true',
                  { path: '/', maxAge: 365 * 24 * 60 * 60 }
                )
              }
            />

            <CheckboxSetting
              name="disableCardTilt"
              label={t('SETTINGS.DISABLE_CARD_HOVER_TILT')}
              checked={cookies.disableCardTilt === 'true'}
              onChange={() =>
                setCookie(
                  'disableCardTilt',
                  cookies.disableCardTilt === 'true' ? 'false' : 'true',
                  { path: '/', maxAge: 365 * 24 * 60 * 60 }
                )
              }
            />

            <CheckboxSetting
              name="tapToPreviewPlay"
              label={t('SETTINGS.TAP_TO_PREVIEW_BEFORE_PLAYING_MOBILE')}
              checked={cookies.tapToPreviewPlay === 'true'}
              onChange={() =>
                setCookie(
                  'tapToPreviewPlay',
                  cookies.tapToPreviewPlay === 'true' ? 'false' : 'true',
                  { path: '/', maxAge: 365 * 24 * 60 * 60 }
                )
              }
            />

            <CheckboxSetting
              name={DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE}
              label={t('SETTINGS.DISABLE_EQUIPMENT_GEM_BUTTONS')}
              tooltip={t('SETTINGS.DISABLE_EQUIPMENT_GEM_BUTTONS_TOOLTIP')}
              checked={cookies[DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE] === 'true'}
              onChange={() =>
                setCookie(
                  DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE,
                  cookies[DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE] === 'true'
                    ? 'false'
                    : 'true',
                  { path: '/', maxAge: 365 * 24 * 60 * 60 }
                )
              }
            />

            <VisualSlider
              label={t('SETTINGS.CARD_SIZE')}
              value={cookies.cardSize ?? 1}
              min={isMobile ? 100 : 50}
              max={150}
              defaultValue={1}
              onChange={(value) =>
                setCookie('cardSize', value, {
                  path: '/',
                  maxAge: 365 * 24 * 60 * 60
                })
              }
            />

            <VisualSlider
              label={t('SETTINGS.CARD_PREVIEW_SIZE')}
              value={cookies.hoverImageSize ?? 1}
              min={75}
              max={125}
              defaultValue={1}
              onChange={(value) =>
                setCookie('hoverImageSize', value, {
                  path: '/',
                  maxAge: 365 * 24 * 60 * 60
                })
              }
            />

            <VisualSlider
              label={t('SETTINGS.TRANSPARENCY')}
              value={cookies.transparencyIntensity ?? 1}
              min={75}
              max={100}
              defaultValue={1}
              onChange={(value) => {
                setCookie('transparencyIntensity', value, {
                  path: '/',
                  maxAge: 365 * 24 * 60 * 60
                });
                setTransparency(value);
              }}
            />

            <VisualSlider
              label={t('SETTINGS.PLAYMAT_INTENSITY')}
              value={cookies.playmatIntensity ?? 0.65}
              min={10}
              max={100}
              defaultValue={0.65}
              onChange={(value) =>
                setCookie('playmatIntensity', value, {
                  path: '/',
                  maxAge: 365 * 24 * 60 * 60
                })
              }
            />
          </Fieldset>

          <CosmeticsSection
            data={data}
            selectedCardBack={initialValues.cardBack}
            selectedPlaymat={initialValues.playMat}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
