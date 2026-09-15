import { SliderDef, ToggleDef } from './settingsRegistry';

export const isUnset = (raw: unknown) =>
  raw === undefined || raw === null || raw === '';

export const toggleFromCookie = (raw: unknown, def: ToggleDef) => {
  if (isUnset(raw)) return def.defaultOn;
  return def.invert ? String(raw) !== 'true' : String(raw) === 'true';
};

export const toggleToCookie = (on: boolean, def: ToggleDef) => {
  const stored = def.invert ? !on : on;
  return stored ? 'true' : 'false';
};

export const toggleFromAccount = (raw: unknown, def: ToggleDef) => {
  if (isUnset(raw)) return def.defaultOn;
  return def.invert ? String(raw) === '0' : String(raw) === '1';
};

export const toggleToAccount = (on: boolean, def: ToggleDef) => {
  const stored = def.invert ? !on : on;
  return stored ? '1' : '0';
};

export const sliderFromCookie = (raw: unknown, def: SliderDef) => {
  const parsed = Number(raw);
  return isUnset(raw) || Number.isNaN(parsed) ? def.defaultValue : parsed;
};

export const sliderFromAccount = (raw: unknown, def: SliderDef) => {
  const parsed = Number(raw);
  return isUnset(raw) || Number.isNaN(parsed) ? def.defaultValue : parsed / 100;
};

export const sliderToAccount = (value: number) =>
  String(Math.round(value * 100));
