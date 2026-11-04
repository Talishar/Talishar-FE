import { useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import GameStaticInfo from 'features/GameStaticInfo';
import {
  getSettingsEntity,
  Setting,
  updateOptions
} from 'features/options/optionsSlice';
import useAuth from 'hooks/useAuth';
import { useTheme } from 'themes/ThemeContext';
import { parseBorderOverrides, presetBorderColor } from './cardBorderColors';
import { useColorblindPreset } from './accessibility';
import {
  hasNotificationPermission,
  requestNotificationPermission
} from './priorityNotifications';
import {
  ColorListDef,
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
  getColor: (def: ColorListDef, id: string) => string;
  getColorDefault: (def: ColorListDef, id: string) => string;
  setColor: (def: ColorListDef, id: string, value: string) => void;
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
  const { t } = useTranslation();
  const settingsData = useAppSelector(getSettingsEntity);
  const { isLoggedIn } = useAuth();
  const { setTransparency } = useTheme();
  const [cookies, setCookie, removeCookie] = useCookies(
    DEVICE_SETTING_COOKIES
  );

  const isSynced = Boolean(isLoggedIn);
  const colorblindPreset = useColorblindPreset();

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
      if (
        def.sideEffect === 'notificationPermission' &&
        !hasNotificationPermission()
      )
        return false;
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
      const write = () => {
        setCookie(def.name, toggleToCookie(on, def), COOKIE_OPTIONS);
        if (isSynced && def.accountName) {
          pushAccountSettings([
            { name: def.accountName, value: toggleToAccount(on, def) }
          ]);
        }
      };
      if (on && def.sideEffect === 'notificationPermission') {
        requestNotificationPermission().then((granted) => {
          if (granted) write();
          else toast.error(t('SETTINGS.PRIORITY_NOTIFICATIONS_BLOCKED'));
        });
        return;
      }
      write();
    },
    [pushAccountSettings, setCookie, isSynced, t]
  );

  const getRadio = useCallback(
    (def: RadioDef) => {
      const raw =
        def.storage === 'device'
          ? cookies[def.name]
          : settingsData[def.name]?.value;
      return isUnset(raw) ? def.defaultValue : Number(raw);
    },
    [settingsData, cookies]
  );

  const setRadio = useCallback(
    (def: RadioDef, value: number) => {
      if (def.storage === 'device') {
        setCookie(def.name, value, COOKIE_OPTIONS);
        return;
      }
      pushAccountSettings([{ name: def.name, value: String(value) }]);
    },
    [pushAccountSettings, setCookie]
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

  const getColorDefault = useCallback(
    (def: ColorListDef, id: string) =>
      (def.options.some((option) => option.id === id)
        ? presetBorderColor(id, colorblindPreset)
        : undefined) ?? '',
    [colorblindPreset]
  );

  const getColor = useCallback(
    (def: ColorListDef, id: string) =>
      parseBorderOverrides(cookies[def.name])[id] ?? getColorDefault(def, id),
    [cookies, getColorDefault]
  );

  const setColor = useCallback(
    (def: ColorListDef, id: string, value: string) => {
      const overrides = parseBorderOverrides(cookies[def.name]);
      if (getColorDefault(def, id) === value.toLowerCase()) delete overrides[id];
      else overrides[id] = value.toLowerCase();
      if (Object.keys(overrides).length === 0) {
        removeCookie(def.name, { path: COOKIE_OPTIONS.path });
        return;
      }
      setCookie(def.name, overrides, COOKIE_OPTIONS);
    },
    [cookies, setCookie, removeCookie, getColorDefault]
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
        case 'colorList':
          return def.options.every(
            (option) =>
              getColor(def, option.id) === getColorDefault(def, option.id)
          );
        default:
          return true;
      }
    },
    [isOn, getRadio, getSlider, getColor, getColorDefault]
  );

  const resetDefs = useCallback(
    (defs: SettingDef[]) => {
      const accountSettings: Setting[] = [];
      defs.forEach((def) => {
        if (def.kind === 'colorList') {
          removeCookie(def.name, { path: COOKIE_OPTIONS.path });
        }
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
        if (def.kind === 'radio' && def.storage === 'device') {
          setCookie(def.name, def.defaultValue, COOKIE_OPTIONS);
        } else if (def.kind === 'radio') {
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
    [pushAccountSettings, setCookie, removeCookie, setTransparency, isSynced]
  );

  return {
    isOn,
    setOn,
    getRadio,
    setRadio,
    getSlider,
    setSlider,
    getColor,
    getColorDefault,
    setColor,
    resetDefs,
    isAtDefault,
    isSynced
  };
};
