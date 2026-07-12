import React, { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import classNames from 'classnames';
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
  'AGB001'
];

const isNonEnglishPromoAltArt = (altPath: string): boolean =>
  NON_ENGLISH_PROMO_ALT_ARTS.some((code) => altPath.startsWith(code));

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
  const altArts = useAppSelector((state: RootState) => state.game.gameInfo.altArts);
  const opponentAltArts = useAppSelector((state: RootState) => state.game.gameInfo.opponentAltArts);

  const altArtMap = useMemo(
    () => altArts ? new Map(altArts.map((a) => [a.cardId, a.altPath])) : null,
    [altArts]
  );
  const opponentAltArtMap = useMemo(
    () => opponentAltArts ? new Map(opponentAltArts.map((a) => [a.cardId, a.altPath])) : null,
    [opponentAltArts]
  );

  let src = props.src;
  const { isShuffling, isOpponent, preferEnglishArt } = props;

  let srcArray = src.split('/');
  const filename = srcArray?.pop()?.split('.')[0] ?? '';
  const isCropped = filename.endsWith('_cropped');
  const baseFilename = isCropped ? filename.slice(0, -'_cropped'.length) : filename;
  let cardNumber = baseFilename.split('-')[0];

  const buildAltSrc = (altPath: string) => {
    const altFilename = isCropped ? `${altPath}_cropped` : altPath;
    return srcArray.join('/') + `/${altFilename}.webp`;
  };

  const skipAltArt = (altPath: string) =>
    preferEnglishArt && isNonEnglishPromoAltArt(altPath);

  if (isOpponent && opponentAltArtMap) {
    const altPath = opponentAltArtMap.get(cardNumber);
    if (altPath && !skipAltArt(altPath)) src = buildAltSrc(altPath);
  } else if (altArtMap) {
    const altPath = altArtMap.get(cardNumber);
    if (altPath && !skipAltArt(altPath)) src = buildAltSrc(altPath);
  }

  const [errorStage, setErrorStage] = useState<'none' | 'reversedFallback' | 'unknown'>('none');

  if (errorStage === 'reversedFallback' && isCropped && cardNumber.endsWith('_r')) {
    srcArray = src.split('/');
    srcArray.pop();
    const baseCardFilename = baseFilename.slice(0, -'_r'.length);
    src = srcArray.join('/') + `/${baseCardFilename}_cropped.webp`;
  } else if (errorStage !== 'none') {
    srcArray = src.split('/');
    srcArray.pop();
    src = srcArray.join('/') + `/${UNKNOWN_IMAGE}.webp`;
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
