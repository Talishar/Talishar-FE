import React, { useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';
import ThemeToggle from 'themes/ThemeToggle';
import GameStaticInfo from 'features/GameStaticInfo';
import styles from './SettingsPanel.module.css';
import {
  CustomDef,
  RadioDef,
  SettingDef,
  SettingsContext,
  SettingsTabId,
  SETTINGS_GROUPS,
  SliderDef,
  ToggleDef,
  getVisibleDefs,
  isDeviceScoped,
  SETTINGS_TABS
} from './settingsRegistry';
import {
  SettingsController,
  useSettingsController
} from './useSettingsController';

interface SettingsPanelProps {
  context: SettingsContext;
  gameInfo: GameStaticInfo;
  /** Rendered as the whole Cosmetics tab. The tab is hidden when omitted. */
  cosmeticsSlot?: React.ReactNode;
  /**
   * Match actions (concede, undo, report). Rendered in a second column beside
   * the Gameplay settings so they stay one click from opening the menu during
   * a game, and above them on narrow screens.
   */
  actionsSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  activeTab?: SettingsTabId;
  onTabChange?: (tab: SettingsTabId) => void;
  /**
   * Search box hosted by the parent (the settings page puts it beside the page
   * title). When set, the panel filters on this value instead of rendering its
   * own input.
   */
  searchQuery?: string;
}

const Tooltip = ({ text }: { text: string }) => (
  <span
    className={styles.tooltipIcon}
    data-tooltip={text}
    data-placement="bottom"
    role="note"
    aria-label={text}
  >
    ?
  </span>
);

const DeviceBadge = () => {
  const { t } = useTranslation();
  return (
    <span className={styles.deviceBadge} title={t('SETTINGS.DEVICE_ONLY_HINT')}>
      {t('SETTINGS.DEVICE_ONLY')}
    </span>
  );
};

const RowHeader = ({
  label,
  tooltip,
  showDeviceBadge
}: {
  label: string;
  tooltip?: string;
  showDeviceBadge: boolean;
}) => (
  <span className={styles.rowLabel}>
    {label}
    {tooltip && <Tooltip text={tooltip} />}
    {showDeviceBadge && <DeviceBadge />}
  </span>
);

const ToggleRow = ({
  def,
  controller
}: {
  def: ToggleDef;
  controller: SettingsController;
}) => {
  const { t } = useTranslation();
  const checked = controller.isOn(def);
  return (
    <label className={styles.row}>
      <RowHeader
        label={t(def.labelKey)}
        tooltip={def.tooltipKey ? t(def.tooltipKey) : undefined}
        showDeviceBadge={isDeviceScoped(def) && !controller.isSynced}
      />
      <input
        type="checkbox"
        role="switch"
        className={styles.switch}
        name={def.name}
        checked={checked}
        onChange={() => controller.setOn(def, !checked)}
      />
    </label>
  );
};

const RadioRow = ({
  def,
  controller
}: {
  def: RadioDef;
  controller: SettingsController;
}) => {
  const { t } = useTranslation();
  const current = controller.getRadio(def);
  return (
    <div
      className={styles.segmented}
      role="radiogroup"
      aria-label={t(def.labelKey)}
    >
      {def.options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={current === option.value}
          className={
            current === option.value
              ? `${styles.segment} ${styles.segmentActive}`
              : styles.segment
          }
          onClick={() => controller.setRadio(def, option.value)}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
};

const SliderRow = ({
  def,
  controller,
  context
}: {
  def: SliderDef;
  controller: SettingsController;
  context: SettingsContext;
}) => {
  const { t } = useTranslation();
  const value = controller.getSlider(def);
  const atDefault = controller.isAtDefault(def);
  return (
    <div className={`${styles.row} ${styles.sliderRow}`}>
      <div className={styles.sliderHeader}>
        <RowHeader
          label={t(def.labelKey)}
          tooltip={def.tooltipKey ? t(def.tooltipKey) : undefined}
          showDeviceBadge={!controller.isSynced}
        />
        <div className={styles.sliderValueGroup}>
          <button
            type="button"
            className={
              atDefault
                ? `${styles.inlineReset} ${styles.inlineResetHidden}`
                : styles.inlineReset
            }
            onClick={() => controller.setSlider(def, def.defaultValue)}
            disabled={atDefault}
            aria-hidden={atDefault}
            tabIndex={atDefault ? -1 : undefined}
            title={t('SETTINGS.RESET_TO', {
              value: Math.round(def.defaultValue * 100),
              unit: '%'
            })}
          >
            {t('OPTIONS_MENU.RESET')}
          </button>
          <span className={styles.sliderValue}>{Math.round(value * 100)}%</span>
        </div>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={def.min(context)}
        max={def.max(context)}
        value={Math.round(value * 100)}
        aria-label={t(def.labelKey)}
        onChange={(event) =>
          controller.setSlider(def, parseInt(event.target.value, 10) / 100)
        }
      />
    </div>
  );
};

const CustomRow = ({ def }: { def: CustomDef }) => {
  const { t } = useTranslation();
  return (
    <div className={`${styles.row} ${styles.customRow}`}>
      <RowHeader label={t(def.labelKey)} showDeviceBadge={false} />
      <div className={styles.customControl}>
        {def.render === 'theme' ? <ThemeToggle /> : <LanguageSelector />}
      </div>
    </div>
  );
};

const SettingRow = ({
  def,
  controller,
  context
}: {
  def: SettingDef;
  controller: SettingsController;
  context: SettingsContext;
}) => {
  switch (def.kind) {
    case 'toggle':
      return <ToggleRow def={def} controller={controller} />;
    case 'radio':
      return <RadioRow def={def} controller={controller} />;
    case 'slider':
      return <SliderRow def={def} controller={controller} context={context} />;
    default:
      return <CustomRow def={def} />;
  }
};

const SettingsPanel = ({
  context,
  gameInfo,
  cosmeticsSlot,
  actionsSlot,
  footerSlot,
  activeTab,
  onTabChange,
  searchQuery
}: SettingsPanelProps) => {
  const { t } = useTranslation();
  const controller = useSettingsController(gameInfo);
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [internalQuery, setInternalQuery] = useState('');
  const hostsOwnSearch = searchQuery === undefined;
  const query = searchQuery ?? internalQuery;
  const [internalTab, setInternalTab] = useState<SettingsTabId>('gameplay');

  const visibleDefs = useMemo(() => getVisibleDefs(context), [context]);

  const tabs = useMemo(
    () =>
      SETTINGS_TABS.filter((tab) => {
        if (tab.id === 'cosmetics') return Boolean(cosmeticsSlot);
        return visibleDefs.some(
          (def) =>
            SETTINGS_GROUPS.find((group) => group.id === def.group)?.tab ===
            tab.id
        );
      }),
    [visibleDefs, cosmeticsSlot]
  );

  const requestedTab = activeTab ?? internalTab;
  const currentTab = tabs.some((tab) => tab.id === requestedTab)
    ? requestedTab
    : tabs[0]?.id ?? 'gameplay';

  const showSplit = Boolean(actionsSlot) && currentTab === 'gameplay';

  const selectTab = (tab: SettingsTabId) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const normalisedQuery = query.trim().toLowerCase();
  const isSearching = normalisedQuery.length > 0;

  const matches = (def: SettingDef) => {
    const group = SETTINGS_GROUPS.find((entry) => entry.id === def.group);
    const haystack = [
      t(def.labelKey),
      group ? t(group.labelKey) : '',
      def.kind === 'radio'
        ? def.options.map((option) => t(option.labelKey)).join(' ')
        : ''
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalisedQuery);
  };

  const groupsFor = (tabId: SettingsTabId, defs: SettingDef[]) =>
    SETTINGS_GROUPS.filter((group) => group.tab === tabId)
      .map((group) => ({
        group,
        defs: defs.filter((def) => def.group === group.id)
      }))
      .filter((entry) => entry.defs.length > 0);

  const resettableDefs = visibleDefs.filter(
    (def) =>
      def.kind !== 'custom' &&
      SETTINGS_GROUPS.find((group) => group.id === def.group)?.tab ===
        currentTab
  );
  const canResetTab = resettableDefs.some(
    (def) => !controller.isAtDefault(def)
  );

  const handleTabKeyDown = (event: React.KeyboardEvent) => {
    const index = tabs.findIndex((tab) => tab.id === currentTab);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const nextTab = tabs[next];
    selectTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  const searchResults = isSearching
    ? tabs
        .map((tab) => ({
          tab,
          groups: groupsFor(tab.id, visibleDefs.filter(matches))
        }))
        .filter((entry) => entry.groups.length > 0)
    : [];

  const tabBody = (
    <>
      {groupsFor(currentTab, visibleDefs).map(({ group, defs }) => (
        <section key={group.id} className={styles.group}>
          <h4 className={styles.groupTitle}>
            {t(group.labelKey)}
            {group.tooltipKey && <Tooltip text={t(group.tooltipKey)} />}
          </h4>
          {defs.map((def) => (
            <SettingRow
              key={def.key}
              def={def}
              controller={controller}
              context={context}
            />
          ))}
        </section>
      ))}
      {canResetTab && (
        <button
          type="button"
          className={styles.resetTab}
          onClick={() => controller.resetDefs(resettableDefs)}
        >
          {t('SETTINGS.RESET_TAB')}
        </button>
      )}
    </>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div
          className={styles.tabList}
          role="tablist"
          aria-label={t('SETTINGS.PAGE_TITLE')}
          onKeyDown={handleTabKeyDown}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-controls={`${baseId}-panel-${tab.id}`}
              aria-selected={!isSearching && tab.id === currentTab}
              tabIndex={tab.id === currentTab ? 0 : -1}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              className={
                !isSearching && tab.id === currentTab
                  ? `${styles.tab} ${styles.tabActive}`
                  : styles.tab
              }
              onClick={() => selectTab(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        {hostsOwnSearch && (
          <input
            type="search"
            className={styles.search}
            value={internalQuery}
            placeholder={t('SETTINGS.SEARCH_PLACEHOLDER')}
            aria-label={t('SETTINGS.SEARCH_PLACEHOLDER')}
            onChange={(event) => setInternalQuery(event.target.value)}
          />
        )}
      </div>

      {isSearching ? (
        <div className={styles.tabPanel}>
          {searchResults.length === 0 && (
            <p className={styles.emptyState}>
              {t('SETTINGS.NO_SEARCH_RESULTS', { query: query.trim() })}
            </p>
          )}
          {searchResults.map(({ tab, groups }) => (
            <section key={tab.id} className={styles.group}>
              <h4 className={styles.groupTitle}>{t(tab.labelKey)}</h4>
              {groups.map(({ group, defs }) => (
                <div key={group.id} className={styles.searchGroup}>
                  <span className={styles.searchGroupLabel}>
                    {t(group.labelKey)}
                  </span>
                  {defs.map((def) => (
                    <SettingRow
                      key={def.key}
                      def={def}
                      controller={controller}
                      context={context}
                    />
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div
          className={
            currentTab === 'cosmetics' || showSplit
              ? `${styles.tabPanel} ${styles.wideTabPanel}`
              : styles.tabPanel
          }
          role="tabpanel"
          id={`${baseId}-panel-${currentTab}`}
          aria-labelledby={`${baseId}-tab-${currentTab}`}
          tabIndex={0}
        >
          {currentTab === 'cosmetics' ? (
            cosmeticsSlot
          ) : showSplit ? (
            <div className={styles.splitTab}>
              <div className={styles.splitMain}>
                {tabBody}
                {footerSlot}
              </div>
              <aside className={styles.splitAside}>{actionsSlot}</aside>
            </div>
          ) : (
            tabBody
          )}
        </div>
      )}

      {!showSplit && footerSlot}
    </div>
  );
};

export default SettingsPanel;
