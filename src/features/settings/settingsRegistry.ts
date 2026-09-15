import * as optConst from 'features/options/constants';
import { DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE } from 'routes/game/components/elements/gemSlider/equipmentGemPreference';

export type SettingsSurface = 'account' | 'game';

export type SettingsTabId =
  | 'gameplay'
  | 'cardSpecific'
  | 'interface'
  | 'cosmetics'
  | 'privacy'
  | 'accessibility';

export interface SettingsContext {
  surface: SettingsSurface;
  isSpectator: boolean;
  canUseManualMode: boolean;
  isMobile: boolean;
}

export interface SettingsTab {
  id: SettingsTabId;
  labelKey: string;
}

export interface SettingsGroup {
  id: string;
  tab: SettingsTabId;
  labelKey: string;
  tooltipKey?: string;
}

interface BaseDef {
  key: string;
  group: string;
  labelKey: string;
  tooltipKey?: string;
  visible?: (ctx: SettingsContext) => boolean;
}

export interface ToggleDef extends BaseDef {
  kind: 'toggle';
  storage: 'account' | 'device';
  /** Account setting name, or the cookie name when storage is 'device'. */
  name: string;
  /**
   * Set on device settings that also persist against the account. The cookie
   * stays as the local copy every consumer reads synchronously, and the
   * account row wins whenever the player is signed in.
   */
  accountName?: string;
  /** The stored value is the opposite of what the label says. */
  invert?: boolean;
  defaultOn: boolean;
}

export interface RadioDef extends BaseDef {
  kind: 'radio';
  name: string;
  options: Array<{ value: number; labelKey: string }>;
  defaultValue: number;
}

export interface SliderDef extends BaseDef {
  kind: 'slider';
  /** Cookie name. */
  name: string;
  /** Account setting name this cookie syncs to. */
  accountName?: string;
  min: (ctx: SettingsContext) => number;
  max: (ctx: SettingsContext) => number;
  defaultValue: number;
  sideEffect?: 'transparency';
}

export interface CustomDef extends BaseDef {
  kind: 'custom';
  render: 'theme' | 'language';
}

export type SettingDef = ToggleDef | RadioDef | SliderDef | CustomDef;

export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'gameplay', labelKey: 'SETTINGS.TABS.GAMEPLAY' },
  { id: 'cardSpecific', labelKey: 'SETTINGS.TABS.CARD_SPECIFIC' },
  { id: 'interface', labelKey: 'SETTINGS.TABS.INTERFACE' },
  { id: 'cosmetics', labelKey: 'SETTINGS.TABS.COSMETICS' },
  { id: 'privacy', labelKey: 'SETTINGS.TABS.PRIVACY' },
  { id: 'accessibility', labelKey: 'SETTINGS.TABS.ACCESSIBILITY' }
];

export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'priority', tab: 'gameplay', labelKey: 'SETTINGS.PRIORITY_SETTINGS' },
  {
    id: 'skipOverrides',
    tab: 'gameplay',
    labelKey: 'SETTINGS.SKIP_OVERRIDES',
    tooltipKey: 'SETTINGS.SKIP_OVERRIDES_TOOLTIP'
  },
  {
    id: 'attackShortcuts',
    tab: 'gameplay',
    labelKey: 'SETTINGS.ATTACK_SHORTCUT_THRESHOLD',
    tooltipKey: 'SETTINGS.ATTACK_SHORTCUT_THRESHOLD_TOOLTIP'
  },
  {
    id: 'matchControls',
    tab: 'gameplay',
    labelKey: 'SETTINGS.GROUPS.MATCH_CONTROLS'
  },
  {
    id: 'cardModes',
    tab: 'cardSpecific',
    labelKey: 'SETTINGS.GROUPS.CARD_MODES',
    tooltipKey: 'SETTINGS.GROUPS.CARD_MODES_TOOLTIP'
  },
  {
    id: 'appearance',
    tab: 'interface',
    labelKey: 'SETTINGS.GROUPS.APPEARANCE'
  },
  {
    id: 'boardLayout',
    tab: 'interface',
    labelKey: 'SETTINGS.GROUPS.BOARD_LAYOUT'
  },
  {
    id: 'cardVisuals',
    tab: 'interface',
    labelKey: 'SETTINGS.GROUPS.CARD_VISUALS'
  },
  { id: 'sizing', tab: 'interface', labelKey: 'SETTINGS.GROUPS.SIZING' },
  { id: 'friends', tab: 'privacy', labelKey: 'SETTINGS.GROUPS.FRIENDS' },
  { id: 'broadcast', tab: 'privacy', labelKey: 'SETTINGS.GROUPS.BROADCAST' },
  {
    id: 'statsSharing',
    tab: 'privacy',
    labelKey: 'SETTINGS.GROUPS.STATS_SHARING',
    tooltipKey: 'SETTINGS.GROUPS.STATS_SHARING_TOOLTIP'
  },
  {
    id: 'accessibility',
    tab: 'accessibility',
    labelKey: 'SETTINGS.GROUPS.ACCESSIBILITY'
  },
  { id: 'sound', tab: 'accessibility', labelKey: 'SETTINGS.GROUPS.SOUND' }
];

const inAMatch = (ctx: SettingsContext) => !ctx.isSpectator;

export const SETTINGS_DEFS: SettingDef[] = [
  {
    kind: 'radio',
    key: 'holdPriority',
    group: 'priority',
    labelKey: 'SETTINGS.PRIORITY_SETTINGS',
    name: optConst.HOLD_PRIORITY_SETTING,
    defaultValue: optConst.HOLD_PRIORITY_ENUM.AUTO,
    visible: inAMatch,
    options: [
      {
        value: optConst.HOLD_PRIORITY_ENUM.AUTO,
        labelKey: 'SETTINGS.PRIORITY_OPTIONS.AUTO_PASS'
      },
      {
        value: optConst.HOLD_PRIORITY_ENUM.ALWAYS_PASS,
        labelKey: 'SETTINGS.PRIORITY_OPTIONS.ALWAYS_PASS'
      },
      {
        value: optConst.HOLD_PRIORITY_ENUM.ALWAYS_HOLD,
        labelKey: 'SETTINGS.PRIORITY_OPTIONS.ALWAYS_HOLD'
      }
    ]
  },
  {
    kind: 'toggle',
    key: 'gemsOffByDefault',
    group: 'priority',
    labelKey: 'SETTINGS.GEMS_OFF_BY_DEFAULT',
    tooltipKey: 'SETTINGS.GEMS_OFF_BY_DEFAULT_TOOLTIP',
    storage: 'account',
    name: optConst.GEMS_OFF_BY_DEFAULT,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'skipAttackReactions',
    group: 'skipOverrides',
    labelKey: 'SETTINGS.SKIP_ATTACK_REACTIONS',
    storage: 'account',
    name: optConst.SKIP_AR_WINDOW,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'skipDefenseReactions',
    group: 'skipOverrides',
    labelKey: 'SETTINGS.SKIP_DEFENSE_REACTIONS',
    storage: 'account',
    name: optConst.SKIP_DR_WINDOW,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'manualTargeting',
    group: 'skipOverrides',
    labelKey: 'SETTINGS.MANUAL_TARGETING',
    storage: 'account',
    name: optConst.AUTO_TARGET_OPPONENT,
    invert: true,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'radio',
    key: 'attackShortcutThreshold',
    group: 'attackShortcuts',
    labelKey: 'SETTINGS.ATTACK_SHORTCUT_THRESHOLD',
    name: optConst.SHORTCUT_ATTACK_THRESHOLD,
    defaultValue: 0,
    // Owned by the in-game control panel (SkipAllAttacksToggle), which resets
    // it every turn, so it does not belong in the settings menu. Kept here as
    // the record of the setting; flip to inAMatch to show the row again.
    visible: () => false,
    options: [
      { value: 0, labelKey: 'SETTINGS.ATTACK_OPTIONS.NEVER_SKIP' },
      { value: 1, labelKey: 'SETTINGS.ATTACK_OPTIONS.SKIP_ONES' },
      { value: 99, labelKey: 'SETTINGS.ATTACK_OPTIONS.SKIP_ALL' }
    ]
  },
  {
    kind: 'toggle',
    key: 'alwaysAllowUndo',
    group: 'matchControls',
    labelKey: 'SETTINGS.ALWAYS_ALLOW_UNDO',
    storage: 'account',
    name: optConst.ALWAYS_ALLOW_UNDO,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'manualMode',
    group: 'matchControls',
    labelKey: 'SETTINGS.MANUAL_MODE',
    tooltipKey: 'SETTINGS.MANUAL_MODE_TOOLTIP',
    storage: 'account',
    name: optConst.MANUAL_MODE,
    defaultOn: false,
    visible: (ctx) => !ctx.isSpectator && ctx.canUseManualMode
  },
  {
    kind: 'toggle',
    key: 'manualTunic',
    group: 'cardModes',
    labelKey: 'SETTINGS.MANUAL_TUNIC_MODE',
    tooltipKey: 'SETTINGS.MANUAL_TUNIC_MODE_TOOLTIP',
    storage: 'account',
    name: optConst.MANUAL_TUNIC,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'manualDynamo',
    group: 'cardModes',
    labelKey: 'SETTINGS.MANUAL_DYNAMO_MODE',
    tooltipKey: 'SETTINGS.MANUAL_DYNAMO_MODE_TOOLTIP',
    storage: 'account',
    name: optConst.MANUAL_DYNAMO,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'custom',
    key: 'theme',
    group: 'appearance',
    labelKey: 'SETTINGS.THEME',
    render: 'theme'
  },
  {
    kind: 'custom',
    key: 'cardsLanguage',
    group: 'appearance',
    labelKey: 'SETTINGS.CARDS_LANGUAGE',
    render: 'language'
  },
  {
    kind: 'toggle',
    key: 'mirroredBoardLayout',
    group: 'boardLayout',
    labelKey: 'SETTINGS.MIRROR_OPPONENT_BOARD',
    storage: 'account',
    name: optConst.MIRRORED_BOARD_LAYOUT,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'mirroredPlayerBoardLayout',
    group: 'boardLayout',
    labelKey: 'SETTINGS.MIRROR_PLAYER_BOARD',
    storage: 'account',
    name: optConst.MIRRORED_PLAYER_BOARD_LAYOUT,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'alwaysShowCounters',
    group: 'boardLayout',
    labelKey: 'SETTINGS.ALWAYS_SHOW_COUNTERS_ON_ZONES',
    storage: 'account',
    name: optConst.ALWAYS_SHOW_COUNTERS,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'alternateArt',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.ALTERNATE_ART',
    storage: 'account',
    name: optConst.DISABLE_ALT_ARTS,
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'heroIntroAnimation',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.HERO_INTRO_ANIMATION',
    storage: 'account',
    name: optConst.DISABLE_HERO_INTRO,
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'particleEffects',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.PARTICLE_EFFECTS',
    storage: 'device',
    name: 'disableParticles',
    accountName: 'DisableParticles',
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'cardHoverTilt',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.CARD_HOVER_TILT',
    storage: 'device',
    name: 'disableCardTilt',
    accountName: 'DisableCardTilt',
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'tapToPreviewPlay',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.TAP_TO_PREVIEW_BEFORE_PLAYING_MOBILE',
    storage: 'device',
    name: 'tapToPreviewPlay',
    accountName: 'TapToPreviewPlay',
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'equipmentGemButtons',
    group: 'cardVisuals',
    labelKey: 'SETTINGS.EQUIPMENT_GEM_BUTTONS',
    tooltipKey: 'SETTINGS.EQUIPMENT_GEM_BUTTONS_TOOLTIP',
    storage: 'device',
    name: DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE,
    accountName: 'DisableEquipmentGemButtons',
    invert: true,
    defaultOn: true
  },
  {
    kind: 'slider',
    key: 'cardSize',
    group: 'sizing',
    labelKey: 'SETTINGS.CARD_SIZE',
    name: 'cardSize',
    accountName: 'CardSize',
    min: (ctx) => (ctx.isMobile ? 100 : 50),
    max: () => 150,
    defaultValue: 1
  },
  {
    kind: 'slider',
    key: 'hoverImageSize',
    group: 'sizing',
    labelKey: 'SETTINGS.CARD_PREVIEW_SIZE',
    name: 'hoverImageSize',
    accountName: 'HoverImageSize',
    min: (ctx) => (ctx.isMobile ? 50 : 75),
    max: (ctx) => (ctx.isMobile ? 100 : 125),
    defaultValue: 1
  },
  {
    kind: 'slider',
    key: 'transparencyIntensity',
    group: 'sizing',
    labelKey: 'SETTINGS.TRANSPARENCY',
    name: 'transparencyIntensity',
    accountName: 'TransparencyIntensity',
    min: () => 75,
    max: () => 100,
    defaultValue: 1,
    sideEffect: 'transparency'
  },
  {
    kind: 'slider',
    key: 'playmatIntensity',
    group: 'sizing',
    labelKey: 'SETTINGS.PLAYMAT_INTENSITY',
    name: 'playmatIntensity',
    accountName: 'PlaymatIntensity',
    min: () => 10,
    max: () => 100,
    defaultValue: 0.65
  },
  {
    kind: 'toggle',
    key: 'hideHandFromFriends',
    group: 'friends',
    labelKey: 'SETTINGS.HIDE_HAND_FROM_FRIENDS',
    tooltipKey: 'SETTINGS.HIDE_HAND_FROM_FRIENDS_TOOLTIP',
    storage: 'account',
    name: optConst.HIDE_HAND_FROM_FRIENDS,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'hideGamesFromFriends',
    group: 'friends',
    labelKey: 'SETTINGS.HIDE_GAMES_FROM_FRIENDS',
    tooltipKey: 'SETTINGS.HIDE_GAMES_FROM_FRIENDS_TOOLTIP',
    storage: 'account',
    name: optConst.HIDE_GAMES_FROM_FRIENDS,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'streamerMode',
    group: 'broadcast',
    labelKey: 'SETTINGS.STREAMER_MODE',
    storage: 'account',
    name: optConst.IS_STREAMER_MODE,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'casterMode',
    group: 'broadcast',
    labelKey: 'SETTINGS.CASTER_MODE',
    tooltipKey: 'SETTINGS.CASTER_MODE_TOOLTIP',
    storage: 'account',
    name: optConst.IS_CASTER_MODE,
    defaultOn: false,
    visible: inAMatch
  },
  {
    kind: 'toggle',
    key: 'fabraryStats',
    group: 'statsSharing',
    labelKey: 'SETTINGS.FABRARY_STATS',
    storage: 'account',
    name: optConst.DISABLE_STATS,
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'globalStats',
    group: 'statsSharing',
    labelKey: 'SETTINGS.GLOBAL_STATS',
    tooltipKey: 'SETTINGS.GLOBAL_STATS_TOOLTIP',
    storage: 'account',
    name: optConst.DISABLE_FABINSIGHTS,
    invert: true,
    defaultOn: true
  },
  {
    kind: 'toggle',
    key: 'colorAccessibilityMode',
    group: 'accessibility',
    labelKey: 'SETTINGS.COLOR_ACCESSIBILITY_MODE',
    storage: 'account',
    name: optConst.COLORBLIND_MODE,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'holdToAutoPass',
    group: 'accessibility',
    labelKey: 'SETTINGS.HOLD_TO_AUTO_PASS',
    tooltipKey: 'SETTINGS.HOLD_TO_AUTO_PASS_TOOLTIP',
    storage: 'account',
    name: optConst.DISABLE_HOLD_TO_AUTO_PASS,
    invert: true,
    defaultOn: false
  },
  {
    kind: 'toggle',
    key: 'gameSounds',
    group: 'sound',
    labelKey: 'SETTINGS.GAME_SOUNDS',
    storage: 'account',
    name: optConst.MUTE_SOUND,
    invert: true,
    defaultOn: true
  }
];

export const DEVICE_SETTING_COOKIES = Array.from(
  new Set(
    SETTINGS_DEFS.filter(
      (def): def is ToggleDef | SliderDef =>
        def.kind === 'slider' ||
        (def.kind === 'toggle' && def.storage === 'device')
    ).map((def) => def.name)
  )
);

export const isDeviceScoped = (def: SettingDef) =>
  def.kind === 'slider' || (def.kind === 'toggle' && def.storage === 'device');

/** Device settings that mirror to an account row when the player is signed in. */
export const SYNCED_DEFS = SETTINGS_DEFS.filter(
  (def): def is ToggleDef | SliderDef =>
    (def.kind === 'toggle' || def.kind === 'slider') &&
    Boolean((def as ToggleDef | SliderDef).accountName)
);

export const getVisibleDefs = (ctx: SettingsContext) =>
  SETTINGS_DEFS.filter((def) => def.visible?.(ctx) ?? true);
