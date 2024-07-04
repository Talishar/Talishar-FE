import { CARD_IMAGES_PATH, CARD_SQUARES_PATH } from './constants';

export type pathType = typeof CARD_IMAGES_PATH | typeof CARD_SQUARES_PATH;

export type ImagePathNumber = {
  path: pathType;
  cardNumber: string;
};

type Locale = { locale: string };

export type CollectionCardImagePathData = ImagePathNumber & Locale;
