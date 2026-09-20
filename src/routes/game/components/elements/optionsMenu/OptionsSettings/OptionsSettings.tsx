import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { Trans } from 'react-i18next';
import styles from './OptionsSettings.module.css';
import { fetchAllSettings, updateOptions } from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import * as optConst from 'features/options/constants';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { useWindowWidth } from 'hooks/useWindowDimensions';
import { RootState } from 'app/Store';
import SettingsPanel from 'features/settings/SettingsPanel';
import { useCanUseManualMode } from 'hooks/useManualMode';
import { SettingsContext } from 'features/settings/settingsRegistry';

interface OptionsSettingsProps {
  cosmeticsSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  /** Search box lives in the menu title bar, so its value comes from there. */
  searchQuery?: string;
}

const OptionsSettings = ({
  cosmeticsSlot,
  actionsSlot,
  searchQuery
}: OptionsSettingsProps) => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const windowWidth = useWindowWidth();
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;
  const canUseManualMode = useCanUseManualMode();

  // fetch all settings when options is loaded
  useEffect(() => {
    dispatch(fetchAllSettings({ game: gameInfo }));
  }, []);

  useShortcut(DEFAULT_SHORTCUTS.TOGGLE_MANUAL_MODE, () => {
    if (!canUseManualMode) return;
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: optConst.MANUAL_MODE, value: '1' }]
      })
    );
  });

  const context: SettingsContext = useMemo(
    () => ({
      surface: 'game',
      isSpectator,
      canUseManualMode,
      isMobile: windowWidth < 768
    }),
    [isSpectator, canUseManualMode, windowWidth]
  );

  return (
    <SettingsPanel
      context={context}
      gameInfo={gameInfo}
      cosmeticsSlot={cosmeticsSlot}
      actionsSlot={actionsSlot}
      searchQuery={searchQuery}
      footerSlot={
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
      }
    />
  );
};

export default OptionsSettings;
