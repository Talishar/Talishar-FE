import React, { useCallback, useState } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import classNames from 'classnames';
import { AltArt } from 'features/GameStaticInfo';
import { DISABLE_ALT_ARTS } from 'features/options/constants';
import styles from './CardImage.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

const selectCardImagePreferences = createSelector(
  [
    (state: RootState) => state.game.gameInfo.altArts,
    (state: RootState) => state.game.gameInfo.opponentAltArts,
    (state: RootState) =>
      String(state.settings?.entities?.[DISABLE_ALT_ARTS]?.value) === '1'
  ],
  (altArts, opponentAltArts, altArtsDisabled) => ({
    altArts,
    opponentAltArts,
    altArtsDisabled
  })
);

// Alt arts of promos printed in a non-English language.
const NON_ENGLISH_PROMO_ALT_ARTS = [
  'FAB331',
  'DDD016',
  '1HP396',
  'FAB474',
  'HER116',
  'HER126',
  'HER127',
  'AGB001',
  '1HP405',
  'HER125'
];

const isNonEnglishPromoAltArt = (altPath: string): boolean => {
  for (let i = 0; i < NON_ENGLISH_PROMO_ALT_ARTS.length; i++) {
    if (altPath.startsWith(NON_ENGLISH_PROMO_ALT_ARTS[i])) return true;
  }
  return false;
};

const altArtIndexCache = new WeakMap<AltArt[], Map<string, string>>();

const getAltArtIndex = (altArts: AltArt[]): Map<string, string> => {
  const cached = altArtIndexCache.get(altArts);
  if (cached !== undefined) return cached;

  const index = new Map<string, string>();
  for (let i = altArts.length - 1; i >= 0; i--) {
    const { cardId, altPath } = altArts[i];
    if (!index.has(cardId)) index.set(cardId, altPath);
  }
  altArtIndexCache.set(altArts, index);
  return index;
};

const findAltArtPath = (
  altArts: AltArt[] | undefined,
  cardNumber: string
): string | undefined => {
  if (!altArts || altArts.length === 0) return undefined;
  return getAltArtIndex(altArts).get(cardNumber);
};

const getDirectory = (path: string): string => {
  const lastSlash = path.lastIndexOf('/');
  return lastSlash === -1 ? '' : path.slice(0, lastSlash);
};

export type ParsedCardImageSource = {
  directory: string;
  baseFilename: string;
  cardNumber: string;
  isCropped: boolean;
};

const CARD_IMAGE_SOURCE_CACHE_LIMIT = 4096;
// Parsing depends only on the exact URL string; the bound prevents paths from
// old languages/games accumulating for the lifetime of a long-lived tab.
const cardImageSourceCache = new Map<string, ParsedCardImageSource>();

export function parseCardImageSource(src: string): ParsedCardImageSource {
  const cached = cardImageSourceCache.get(src);
  if (cached !== undefined) return cached;

  const lastSlash = src.lastIndexOf('/');
  const directory = lastSlash === -1 ? '' : src.slice(0, lastSlash);
  const filenameWithExtension = src.slice(lastSlash + 1);
  const firstDot = filenameWithExtension.indexOf('.');
  const filename =
    firstDot === -1
      ? filenameWithExtension
      : filenameWithExtension.slice(0, firstDot);
  const isCropped = filename.endsWith('_cropped');
  const baseFilename = isCropped
    ? filename.slice(0, -'_cropped'.length)
    : filename;
  const firstDash = baseFilename.indexOf('-');
  const cardNumber =
    firstDash === -1 ? baseFilename : baseFilename.slice(0, firstDash);

  const parsed = { directory, baseFilename, cardNumber, isCropped };
  if (cardImageSourceCache.size >= CARD_IMAGE_SOURCE_CACHE_LIMIT) {
    const oldestSource = cardImageSourceCache.keys().next().value;
    if (oldestSource !== undefined) cardImageSourceCache.delete(oldestSource);
  }
  cardImageSourceCache.set(src, parsed);
  return parsed;
}

export interface CardImage {
  src: string;
  alt?: string;
  className?: string;
  draggable?: React.ImgHTMLAttributes<HTMLImageElement>['draggable'];
  isShuffling?: boolean;
  isOpponent?: boolean;
  preferEnglishArt?: boolean;
  eager?: boolean;
}

export const CardImage = React.memo((props: CardImage) => {
  const { altArts, opponentAltArts, altArtsDisabled } = useAppSelector(
    selectCardImagePreferences
  );

  let src = props.src;
  const { isShuffling, isOpponent, preferEnglishArt, eager } = props;
  const { directory, baseFilename, cardNumber, isCropped } =
    parseCardImageSource(src);

  const altPath = altArtsDisabled
    ? undefined
    : findAltArtPath(isOpponent ? opponentAltArts : altArts, cardNumber);
  if (altPath && !(preferEnglishArt && isNonEnglishPromoAltArt(altPath))) {
    const altFilename = isCropped ? `${altPath}_cropped` : altPath;
    src = `${directory}/${altFilename}.webp`;
  }

  const [errorStage, setErrorStage] = useState<
    'none' | 'reversedFallback' | 'unknown'
  >('none');

  if (
    errorStage === 'reversedFallback' &&
    isCropped &&
    cardNumber.endsWith('_r')
  ) {
    const fallbackDirectory = getDirectory(src);
    const baseCardFilename = baseFilename.slice(0, -'_r'.length);
    src = `${fallbackDirectory}/${baseCardFilename}_cropped.webp`;
  } else if (errorStage !== 'none') {
    const fallbackDirectory = getDirectory(src);
    src = `${fallbackDirectory}/${UNKNOWN_IMAGE}.webp`;
  }

  const handleImageError = useCallback(() => {
    setErrorStage((prev) =>
      prev === 'none' && isCropped && cardNumber.endsWith('_r')
        ? 'reversedFallback'
        : 'unknown'
    );
  }, [isCropped, cardNumber]);

  const imageClassNames = classNames(props.className, {
    [styles.shuffling]: isShuffling
  });

  return (
    <>
      <img
        src={src}
        alt={props.alt ?? ''}
        className={imageClassNames}
        onError={handleImageError}
        draggable={props.draggable}
        loading={eager ? 'eager' : 'lazy'}
        {...(eager ? { fetchpriority: 'high' } : null)}
        decoding="async"
      />
    </>
  );
});

CardImage.displayName = 'CardImage';
export default CardImage;
