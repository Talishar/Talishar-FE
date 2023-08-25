import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './CardImage.module.css';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';

const UNKNOWN_IMAGE = 'Difficulties';

export interface CardImage {
  src: string;
  className?: string;
  //@ts-ignore Booleanish is allowed, right?
  draggable?: Booleanish;
}

export const CardImage = (props: CardImage) => {
  const { altArts } = useAppSelector(getGameInfo, shallowEqual);
  let src = props.src;

  let srcArray = src.split('/');
  let cardNumber = srcArray?.pop()?.substring(0, 6);

  if (altArts) {
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

  return (
    <>
      <img
        src={src}
        className={props.className}
        onError={handleImageError}
        draggable={props.draggable}
      />
    </>
  );
};

export default CardImage;
