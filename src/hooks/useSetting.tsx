import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { QUERY_STATUS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import {
  fetchAllSettings,
  getSettingsStatus,
  settingsSelectors
} from 'features/options/optionsSlice';
import { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';

export default function useSetting({ settingName }: { settingName: string }) {
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const settingsLoaded = useAppSelector(getSettingsStatus);
  useEffect(() => {
    if (gameInfo.gameID) {
      if (settingsLoaded === QUERY_STATUS.IDLE) {
        dispatch(fetchAllSettings({ game: gameInfo }));
      }
    }
  }, [settingsLoaded, gameInfo.gameID]);

  const getSetting = useAppSelector((state) =>
    settingsSelectors.selectById(state, settingName)
  );

  return getSetting;
}
