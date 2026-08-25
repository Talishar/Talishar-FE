import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { QUERY_STATUS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import {
  fetchAllSettings,
  getSettingsStatus,
  settingsSelectors
} from 'features/options/optionsSlice';
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

export default function useSetting({ settingName }: { settingName: string }) {
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const needsInitialLoad = useAppSelector(
    (state) => getSettingsStatus(state) === QUERY_STATUS.IDLE
  );
  useEffect(() => {
    if (gameInfo.gameID) {
      if (needsInitialLoad) {
        dispatch(fetchAllSettings({ game: gameInfo }));
      }
    }
  }, [needsInitialLoad, gameInfo.gameID]);

  const getSetting = useAppSelector((state) =>
    settingsSelectors.selectById(state, settingName)
  );

  return getSetting;
}
