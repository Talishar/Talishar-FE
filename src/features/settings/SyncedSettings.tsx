import { useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { QUERY_STATUS } from 'appConstants';
import {
  fetchAllSettings,
  getSettingsEntity,
  getSettingsStatus,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import useAuth from 'hooks/useAuth';
import {
  DEVICE_SETTING_COOKIES,
  SliderDef,
  SYNCED_DEFS,
  ToggleDef
} from './settingsRegistry';
import { COOKIE_OPTIONS } from './useSettingsController';
import {
  isUnset,
  sliderFromCookie,
  sliderToAccount,
  toggleFromCookie,
  toggleToAccount,
  toggleToCookie
} from './syncedValues';

const PROFILE_GAME_INFO = {
  playerID: 0,
  gameID: 0,
  authKey: '',
  isPrivateLobby: false
};

const accountValueFor = (def: ToggleDef | SliderDef, cookie: unknown) =>
  def.kind === 'toggle'
    ? toggleToAccount(toggleFromCookie(cookie, def), def)
    : sliderToAccount(sliderFromCookie(cookie, def));

const cookieValueFor = (def: ToggleDef | SliderDef, account: unknown) =>
  def.kind === 'toggle'
    ? toggleToCookie(String(account) === (def.invert ? '0' : '1'), def)
    : String(Number(account) / 100);

const SyncedSettings = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAuth();
  const settingsData = useAppSelector(getSettingsEntity);
  const settingsStatus = useAppSelector(getSettingsStatus);
  const activeGameID = useAppSelector(
    (state: RootState) => state.game.gameInfo.gameID
  );
  const [cookies, setCookie] = useCookies(DEVICE_SETTING_COOKIES);
  const uploadedRef = useRef<Set<string>>(new Set());
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || activeGameID || prefetchedRef.current) return;
    if (settingsStatus !== QUERY_STATUS.IDLE) return;
    if (window.location.pathname.startsWith('/game/')) return;
    prefetchedRef.current = true;
    dispatch(fetchAllSettings({ game: PROFILE_GAME_INFO }));
  }, [isLoggedIn, activeGameID, settingsStatus, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const toUpload: Setting[] = [];
    SYNCED_DEFS.forEach((def) => {
      if (!def.accountName) return;
      const account = settingsData[def.accountName]?.value;
      const cookie = cookies[def.name];

      if (isUnset(account)) {
        if (isUnset(cookie) || uploadedRef.current.has(def.accountName)) return;
        uploadedRef.current.add(def.accountName);
        toUpload.push({
          name: def.accountName,
          value: accountValueFor(def, cookie)
        });
        return;
      }

      const mirrored = cookieValueFor(def, account);
      if (String(cookie) !== mirrored) {
        setCookie(def.name, mirrored, COOKIE_OPTIONS);
      }
    });

    if (toUpload.length) {
      dispatch(updateOptions({ game: PROFILE_GAME_INFO, settings: toUpload }));
    }
  }, [isLoggedIn, settingsData, cookies, setCookie, dispatch]);

  return null;
};

export default SyncedSettings;
