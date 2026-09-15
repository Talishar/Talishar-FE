import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCosmeticsQuery } from 'features/api/apiSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  fetchAllSettings,
  getSettingsEntity,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import { useWindowWidth } from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';
import SettingsPanel from 'features/settings/SettingsPanel';
import {
  SettingsContext,
  SettingsTabId,
  SETTINGS_TABS
} from 'features/settings/settingsRegistry';
import { CosmeticsSection } from '../../game/components/elements/optionsMenu/OptionsSettings/CosmeticsSection';
import styles from './settings.module.css';

// Settings are edited outside of any game here, so the API calls carry a
// placeholder game instead of a live one.
const PROFILE_GAME_INFO = {
  playerID: 0,
  gameID: 0,
  authKey: '',
  isPrivateLobby: false
};

const SettingsPage = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.SETTINGS'));
  const dispatch = useAppDispatch();
  const settingsData = useAppSelector(getSettingsEntity);
  const windowWidth = useWindowWidth();
  const { data: cosmeticsData } = useGetCosmeticsQuery(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllSettings({ game: PROFILE_GAME_INFO }));
  }, [dispatch]);

  const handleSettingsChange = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: PROFILE_GAME_INFO,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const context: SettingsContext = useMemo(
    () => ({
      surface: 'account',
      isSpectator: false,
      canUseManualMode: false,
      isMobile: windowWidth < 768
    }),
    [windowWidth]
  );

  const requestedTab = searchParams.get('tab');
  const activeTab = SETTINGS_TABS.some((tab) => tab.id === requestedTab)
    ? (requestedTab as SettingsTabId)
    : undefined;

  const handleTabChange = (tab: SettingsTabId) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className={styles.wideContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('SETTINGS.PAGE_TITLE')}</h1>
        <input
          type="search"
          className={styles.search}
          value={query}
          placeholder={t('SETTINGS.SEARCH_PLACEHOLDER')}
          aria-label={t('SETTINGS.SEARCH_PLACEHOLDER')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <SettingsPanel
        context={context}
        gameInfo={PROFILE_GAME_INFO}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={query}
        cosmeticsSlot={
          <CosmeticsSection
            data={cosmeticsData}
            selectedCardBack={String(
              settingsData[optConst.CARD_BACK]?.value ?? '0'
            )}
            selectedPlaymat={String(
              settingsData[optConst.MY_PLAYMAT]?.value ?? '0'
            )}
            onSettingsChange={handleSettingsChange}
          />
        }
      />
    </div>
  );
};

export default SettingsPage;
