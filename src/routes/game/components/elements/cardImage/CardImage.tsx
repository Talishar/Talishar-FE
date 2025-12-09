import React, { useState, useEffect } from 'react';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
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

export const CardImage = (props: CardImage) => {
  const { altArts, opponentAltArts } = useAppSelector(getGameInfo, shallowEqual);
  let src = props.src;
  const { isShuffling, isOpponent } = props;

  let srcArray = src.split('/');
  let cardNumber = srcArray?.pop()?.split(".")[0]?.split('-')[0];

  if (isOpponent && opponentAltArts) {
    for (let i = 0; i < opponentAltArts.length; i++) {
      if (cardNumber == opponentAltArts[i].cardId)
        src = srcArray.join('/') + `/${opponentAltArts[i].altPath}.webp`;
    }
  } else if (altArts) {
    for (let i = 0; i < altArts.length; i++) {
      if (cardNumber == altArts[i].cardId)
        src = srcArray.join('/') + `/${altArts[i].altPath}.webp`;
    }
  }

  const [error, setError] = useState(false);

  if (error) {
    let srcArray = src.split('/');
    srcArray.pop();
    src = srcArray.join('/') + `/${UNKNOWN_IMAGE}.webp`;
  }

  const handleImageError = () => {
    setError(true);
  };

  const imageClassNames = classNames(props.className, {
    [styles.shuffling]: isShuffling,
  });

  return (
    <>
      <img
        src={src}
        className={imageClassNames}
        onError={handleImageError}
        draggable={props.draggable}
      />
    </>
  );
};

export default CardImage;
