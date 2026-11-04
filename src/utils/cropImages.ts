import type { CSSProperties } from 'react';
import { CLOUD_IMAGES_URL } from 'appConstants';

export const generateCroppedImageUrl = (cardName: string): string =>
  `${CLOUD_IMAGES_URL}/crops/${cardName}_cropped.webp`;

const HERO_CROP_FOCUS_X: Record<string, string> = {
  kayo_underhanded_cheat: 'left',
  SUP063: 'left'
};

export const getHeroCropFocusX = (cardName?: string): string | undefined =>
  cardName ? HERO_CROP_FOCUS_X[cardName] : undefined;

export const cropFocusStyle = (focusX?: string): CSSProperties | undefined =>
  focusX ? ({ '--hero-focus-x': focusX } as CSSProperties) : undefined;

export const heroCropFocusStyle = (
  cardName?: string
): CSSProperties | undefined => cropFocusStyle(getHeroCropFocusX(cardName));
