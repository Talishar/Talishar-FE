import {
  EUROPEAN_LANGUAGES,
  JAPANESE_LANGUAGE,
  LOCALE_DICTIONARY,
  DEFAULT_LANGUAGE,
  EUROPEAN_LANGUAGES_PRINTED_COLLECTIONS,
  COLLECTIONS_HISTORY_PACK_1,
  COLLECTIONS_HISTORY_PACK_2,
  ALTERNATIVE_ARTS_CODES,
  CARD_IMAGES_PATH,
  FRENCH_PRINTED_COLLECTIONS,
  JAPANESE_LANGUAGE_PRINTED_COLLECTIONS
} from './constants';
import { historyPack1, historyPack2, setIDs } from './collectionMaps';
import { CollectionCardImagePathData, ImagePathNumber } from './types';
import { CLOUD_IMAGES_URL } from 'appConstants';

const getCollectionCode = (cardNumber: string): string =>
  Object.keys(setIDs).includes(cardNumber)
    ? setIDs[cardNumber].substring(0, 3)
    : cardNumber.substring(0, 3);

const getSetID = (cardNumber: string): string =>
  Object.keys(setIDs).includes(cardNumber) ? setIDs[cardNumber] : cardNumber;

const isJapaneseCard = (locale: string, collectionCode: string): boolean =>
  locale === JAPANESE_LANGUAGE &&
  JAPANESE_LANGUAGE_PRINTED_COLLECTIONS.includes(collectionCode);

// This condition is created due to LSS removing support to Spanish, German and Italian languages from "High Seas" set
const isFrenchNewSupportedSets = (
  locale: string,
  collectionCode: string
): boolean =>
  locale === 'fr' && FRENCH_PRINTED_COLLECTIONS.includes(collectionCode);

const isEuropeanCard = (
  locale: string,
  cardNumber: string,
  collectionCode: string
): boolean =>
  EUROPEAN_LANGUAGES.includes(locale) &&
  (EUROPEAN_LANGUAGES_PRINTED_COLLECTIONS.includes(collectionCode) ||
    isHistoryPackCard(collectionCode, cardNumber) ||
    isFrenchNewSupportedSets(locale, collectionCode));

const isHistoryPack1Card = (
  collectionCode: string,
  cardNumber: string
): boolean =>
  COLLECTIONS_HISTORY_PACK_1.includes(collectionCode) &&
  Object.keys(historyPack1).includes(cardNumber);

const isHistoryPack2Card = (
  collectionCode: string,
  cardNumber: string
): boolean =>
  COLLECTIONS_HISTORY_PACK_2.includes(collectionCode) &&
  Object.keys(historyPack2).includes(cardNumber);

const isHistoryPackCard = (
  collectionCode: string,
  cardNumber: string
): boolean =>
  isHistoryPack1Card(collectionCode, cardNumber) ||
  isHistoryPack2Card(collectionCode, cardNumber);

const isAlternativeArt = (cardNumber: string): boolean =>
  ALTERNATIVE_ARTS_CODES.some((code: string) => cardNumber.includes(code));

/**
 * Resolves CDN folder (`english` | `japanese` | `french` | …) and filename stem.
 * All card image files use Talishar cardID as the basename (alt-art URL suffixes are separate).
 * History-pack logic only picks localized folders, not 1HP/2HP filenames.
 */
export const getCardImagePathParts = (
  locale: string = DEFAULT_LANGUAGE,
  cardNumber: string = 'CardBack'
): { languagePath: string; cardNumber: string } => {
  const cardPathData = {
    languagePath: LOCALE_DICTIONARY[DEFAULT_LANGUAGE],
    cardNumber
  };
  const collectionCode = getCollectionCode(cardNumber);
  const setID = getSetID(cardNumber);

  if (locale !== DEFAULT_LANGUAGE && !isAlternativeArt(cardNumber)) {
    if (isJapaneseCard(locale, collectionCode)) {
      Object.assign(cardPathData, { languagePath: LOCALE_DICTIONARY[locale] });
    } else if (isEuropeanCard(locale, setID, collectionCode)) {
      Object.assign(cardPathData, { languagePath: LOCALE_DICTIONARY[locale] });
    }
  }

  return cardPathData;
};

/** Crop CDN subfolder — same `languagePath` as cardimages (aligned with zzImageConverter folders). */
export const getCropsSubfolder = (
  locale: string,
  cardIdentifier: string
): string => {
  const { languagePath } = getCardImagePathParts(locale, cardIdentifier);
  return languagePath;
};

export const getCollectionCardImagePath = ({
  path = CARD_IMAGES_PATH,
  locale = 'en',
  cardNumber = 'CardBack'
}: CollectionCardImagePathData): string => {
  const { languagePath, cardNumber: resolved } = getCardImagePathParts(
    locale,
    cardNumber
  );
  return `${CLOUD_IMAGES_URL}/${path}/${languagePath}/${resolved}.webp`;
};

export const loadInitialLanguage = () => {
  const languageLoadedLocalStorage = localStorage.getItem('language');
  return languageLoadedLocalStorage
    ? languageLoadedLocalStorage
    : DEFAULT_LANGUAGE;
};
