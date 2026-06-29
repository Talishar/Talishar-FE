import React, { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import classNames from 'classnames';
import styles from './CardImage.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

export interface CardImage {
  src: string;
  className?: string;
  //@ts-ignore Booleanish is allowed, right?
  draggable?: Booleanish;
  isShuffling?: boolean;
  isOpponent?: boolean;
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
  const { isShuffling, isOpponent } = props;

  let srcArray = src.split('/');
  const filename = srcArray?.pop()?.split('.')[0] ?? '';
  const isCropped = filename.endsWith('_cropped');
  const baseFilename = isCropped ? filename.slice(0, -'_cropped'.length) : filename;
  let cardNumber = baseFilename.split('-')[0];

  const buildAltSrc = (altPath: string) => {
    const altFilename = isCropped ? `${altPath}_cropped` : altPath;
    return srcArray.join('/') + `/${altFilename}.webp`;
  };

  if (isOpponent && opponentAltArtMap) {
    const altPath = opponentAltArtMap.get(cardNumber);
    if (altPath) src = buildAltSrc(altPath);
  } else if (altArtMap) {
    const altPath = altArtMap.get(cardNumber);
    if (altPath) src = buildAltSrc(altPath);
  }

  const [error, setError] = useState(false);

  if (error) {
    let srcArray = src.split('/');
    srcArray.pop();
    src = srcArray.join('/') + `/${UNKNOWN_IMAGE}.webp`;
  }

  const handleImageError = useCallback(() => setError(true), []);

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
