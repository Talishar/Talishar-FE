import React, { useCallback, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import classNames from 'classnames';
import { AltArt } from 'features/GameStaticInfo';
import styles from './CardImage.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

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
  '1HP405'
];

const isNonEnglishPromoAltArt = (altPath: string): boolean => {
  for (let i = 0; i < NON_ENGLISH_PROMO_ALT_ARTS.length; i++) {
    if (altPath.startsWith(NON_ENGLISH_PROMO_ALT_ARTS[i])) return true;
  }
  return false;
};

const findAltArtPath = (
  altArts: AltArt[] | undefined,
  cardNumber: string
): string | undefined => {
  if (!altArts) return undefined;
  for (let i = altArts.length - 1; i >= 0; i--) {
    if (altArts[i].cardId === cardNumber) return altArts[i].altPath;
  }
  return undefined;
};

const getDirectory = (path: string): string => {
  const lastSlash = path.lastIndexOf('/');
  return lastSlash === -1 ? '' : path.slice(0, lastSlash);
};

export interface CardImage {
  src: string;
  className?: string;
  //@ts-ignore Booleanish is allowed, right?
  draggable?: Booleanish;
  isShuffling?: boolean;
  isOpponent?: boolean;
  preferEnglishArt?: boolean;
}

export const CardImage = React.memo((props: CardImage) => {
  const altArts = useAppSelector(
    (state: RootState) => state.game.gameInfo.altArts
  );
  const opponentAltArts = useAppSelector(
    (state: RootState) => state.game.gameInfo.opponentAltArts
  );

  let src = props.src;
  const { isShuffling, isOpponent, preferEnglishArt } = props;

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

  const altPath = findAltArtPath(
    isOpponent ? opponentAltArts : altArts,
    cardNumber
  );
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
        className={imageClassNames}
        onError={handleImageError}
        draggable={props.draggable}
        loading="lazy"
        decoding="async"
      />
    </>
  );
});

CardImage.displayName = 'CardImage';
export default CardImage;
