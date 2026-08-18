import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from './OptionsSettings.module.css';
import {
  fetchAllSettings,
  getSettingsEntity,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import * as optConst from 'features/options/constants';
import { useCookies } from 'react-cookie';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { CheckboxSetting, RadioGroup, Fieldset } from './FormComponents';
import { VisualSlider } from './VisualSettings';
import useWindowDimensions from 'hooks/useWindowDimensions';
import ThemeToggle from 'themes/ThemeToggle';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';
import { RootState } from 'app/Store';
import { useTheme } from 'themes/ThemeContext';
import { Trans, useTranslation } from 'react-i18next';
import { DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE } from '../../gemSlider/equipmentGemPreference';

const OptionsSettings = () => {
  const { t } = useTranslation();
  const { setTransparency } = useTheme();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;
  const isOpponentAI = useAppSelector(
    (state: RootState) => state.game.gameInfo.isOpponentAI ?? false
  );
  const isPrivate = useAppSelector(
    (state: RootState) =>
      (state.game.gameInfo.isPrivate ?? false) ||
      (state.game.gameInfo.isPrivateLobby ?? false)
  );
  const isPracticeDummy = useAppSelector(
    (state: RootState) => state.game.playerTwo?.Name === 'Practice Dummy'
  );
  const isLocalEnvironment =
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost';
  const isFuturesFormat = useAppSelector((state: RootState) => {
    const fmt = state.game.gameInfo.gameFormat ?? '';
    return fmt === 'futurecc' || fmt === 'futurell' || fmt === 'futuresage';
  });
  const canUseManualMode =
    isLocalEnvironment ||
    isOpponentAI ||
    isPracticeDummy ||
    isPrivate ||
    isFuturesFormat;
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
    disableAltArts: settingsData['DisableAltArts']?.value === '1',
    casterMode: settingsData['IsCasterMode']?.value === '1',
    streamerMode: settingsData['IsStreamerMode']?.value === '1',
    alwaysAllowUndo: settingsData['AlwaysAllowUndo']?.value === '1',
    manualTunic: settingsData['ManualTunic']?.value === '1',
    disableFabInsights: settingsData['DisableFabInsights']?.value === '1',
    disableHeroIntro: settingsData['DisableHeroIntro']?.value === '1',
    mirroredBoardLayout:
      settingsData[optConst.MIRRORED_BOARD_LAYOUT]?.value === '1',
    mirroredPlayerBoardLayout:
      settingsData[optConst.MIRRORED_PLAYER_BOARD_LAYOUT]?.value === '1',
    alwaysShowCounters:
      String(settingsData[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1',
    hideHandFromFriends:
      settingsData[optConst.HIDE_HAND_FROM_FRIENDS]?.value === '1',
    gemsOffByDefault: settingsData[optConst.GEMS_OFF_BY_DEFAULT]?.value === '1'
  };

  useShortcut(DEFAULT_SHORTCUTS.TOGGLE_MANUAL_MODE, () => {
    handleSettingsChange({ name: optConst.MANUAL_MODE, value: '1' });
  });

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
    <div className={styles.leftColumn}>
      {!isSpectator && (
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
      )}
      {!isSpectator && (
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
      )}

      {!isSpectator && (
        <Fieldset
          legend={t('SETTINGS.ATTACK_SHORTCUT_THRESHOLD')}
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
      )}

      {!isSpectator && (
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
          {canUseManualMode && (
            <CheckboxSetting
              name="manualMode"
              label={t('SETTINGS.MANUAL_MODE')}
              checked={initialValues.manualMode}
              onChange={() =>
                handleSettingsChange({
                  name: optConst.MANUAL_MODE,
                  value: initialValues.manualMode ? '0' : '1'
                })
              }
              ariaDisabled={true}
            />
          )}
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
      )}

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
          min={isMobile ? 50 : 75}
          max={isMobile ? 100 : 125}
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

      <p className={styles.disclaimer}>
        <Trans
          i18nKey="OPTIONS_MENU.DISCLAIMER"
          components={{
            1: (
              <a
                href="https://legendstory.com/"
                target="_blank"
                rel="noreferrer"
              />
            )
          }}
        />
      </p>
    </div>
  );
};

export default OptionsSettings;
