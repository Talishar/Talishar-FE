import { useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import GameStaticInfo from 'features/GameStaticInfo';
import {
  getSettingsEntity,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import useAuth from 'hooks/useAuth';
import { useTheme } from 'themes/ThemeContext';
import {
  DEVICE_SETTING_COOKIES,
  RadioDef,
  SettingDef,
  SliderDef,
  ToggleDef
} from './settingsRegistry';
import {
  isUnset,
  sliderFromAccount,
  sliderFromCookie,
  sliderToAccount,
  toggleFromAccount,
  toggleFromCookie,
  toggleToAccount,
  toggleToCookie
} from './syncedValues';

export const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 365 * 24 * 60 * 60
} as const;

export interface SettingsController {
  isOn: (def: ToggleDef) => boolean;
  setOn: (def: ToggleDef, on: boolean) => void;
  getRadio: (def: RadioDef) => number;
  setRadio: (def: RadioDef, value: number) => void;
  getSlider: (def: SliderDef) => number;
  setSlider: (def: SliderDef, value: number) => void;
  resetDefs: (defs: SettingDef[]) => void;
  isAtDefault: (def: SettingDef) => boolean;
  isSynced: boolean;
}

const accountRaw = (on: boolean, invert?: boolean) => {
  if (invert) return on ? '0' : '1';
  return on ? '1' : '0';
};

export const useSettingsController = (
  gameInfo: GameStaticInfo
): SettingsController => {
  const dispatch = useAppDispatch();
  const settingsData = useAppSelector(getSettingsEntity);
  const { isLoggedIn } = useAuth();
  const { setTransparency } = useTheme();
  const [cookies, setCookie] = useCookies(DEVICE_SETTING_COOKIES);

  const isSynced = Boolean(isLoggedIn);

  const pushAccountSettings = useCallback(
    (settings: Setting[]) => {
      if (!settings.length) return;
      dispatch(updateOptions({ game: gameInfo, settings }));
    },
    [dispatch, gameInfo]
  );

  const syncedAccountValue = useCallback(
    (def: ToggleDef | SliderDef) => {
      if (!isSynced || !def.accountName) return undefined;
      const raw = settingsData[def.accountName]?.value;
      return isUnset(raw) ? undefined : raw;
    },
    [isSynced, settingsData]
  );

  const isOn = useCallback(
    (def: ToggleDef) => {
      if (def.storage === 'account') {
        return toggleFromAccount(settingsData[def.name]?.value, def);
      }
      const account = syncedAccountValue(def);
      if (account !== undefined) return toggleFromAccount(account, def);
      return toggleFromCookie(cookies[def.name], def);
    },
    [settingsData, cookies, syncedAccountValue]
  );

  const setOn = useCallback(
    (def: ToggleDef, on: boolean) => {
      if (def.storage === 'account') {
        pushAccountSettings([
          { name: def.name, value: accountRaw(on, def.invert) }
        ]);
        return;
      }
      setCookie(def.name, toggleToCookie(on, def), COOKIE_OPTIONS);
      if (isSynced && def.accountName) {
        pushAccountSettings([
          { name: def.accountName, value: toggleToAccount(on, def) }
        ]);
      }
    },
    [pushAccountSettings, setCookie, isSynced]
  );

  const getRadio = useCallback(
    (def: RadioDef) => {
      const raw = settingsData[def.name]?.value;
      return isUnset(raw) ? def.defaultValue : Number(raw);
    },
    [settingsData]
  );

  const setRadio = useCallback(
    (def: RadioDef, value: number) => {
      pushAccountSettings([{ name: def.name, value: String(value) }]);
    },
    [pushAccountSettings]
  );

  const getSlider = useCallback(
    (def: SliderDef) => {
      const account = syncedAccountValue(def);
      if (account !== undefined) return sliderFromAccount(account, def);
      return sliderFromCookie(cookies[def.name], def);
    },
    [cookies, syncedAccountValue]
  );

  const setSlider = useCallback(
    (def: SliderDef, value: number) => {
      setCookie(def.name, value, COOKIE_OPTIONS);
      if (def.sideEffect === 'transparency') setTransparency(value);
      if (isSynced && def.accountName) {
        pushAccountSettings([
          { name: def.accountName, value: sliderToAccount(value) }
        ]);
      }
    },
    [setCookie, setTransparency, pushAccountSettings, isSynced]
  );

  const isAtDefault = useCallback(
    (def: SettingDef) => {
      switch (def.kind) {
        case 'toggle':
          return isOn(def) === def.defaultOn;
        case 'radio':
          return getRadio(def) === def.defaultValue;
        case 'slider':
          return Math.abs(getSlider(def) - def.defaultValue) < 0.005;
        default:
          return true;
      }
    },
    [isOn, getRadio, getSlider]
  );

  const resetDefs = useCallback(
    (defs: SettingDef[]) => {
      const accountSettings: Setting[] = [];
      defs.forEach((def) => {
        if (def.kind === 'toggle') {
          if (def.storage === 'account') {
            accountSettings.push({
              name: def.name,
              value: accountRaw(def.defaultOn, def.invert)
            });
            return;
          }
          setCookie(
            def.name,
            toggleToCookie(def.defaultOn, def),
            COOKIE_OPTIONS
          );
          if (isSynced && def.accountName) {
            accountSettings.push({
              name: def.accountName,
              value: toggleToAccount(def.defaultOn, def)
            });
          }
        }
        if (def.kind === 'radio') {
          accountSettings.push({
            name: def.name,
            value: String(def.defaultValue)
          });
        }
        if (def.kind === 'slider') {
          setCookie(def.name, def.defaultValue, COOKIE_OPTIONS);
          if (def.sideEffect === 'transparency')
            setTransparency(def.defaultValue);
          if (isSynced && def.accountName) {
            accountSettings.push({
              name: def.accountName,
              value: sliderToAccount(def.defaultValue)
            });
          }
        }
      });
      pushAccountSettings(accountSettings);
    },
    [pushAccountSettings, setCookie, setTransparency, isSynced]
  );

  return {
    isOn,
    setOn,
    getRadio,
    setRadio,
    getSlider,
    setSlider,
    resetDefs,
    isAtDefault,
    isSynced
  };
};
