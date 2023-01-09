import React, { useState } from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './CardImage.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

export interface CardImage {
  src: string;
  className?: string;
  draggable?: Booleanish;
}

export const CardImage = (props: CardImage) => {
  let src = props.src;
  const [error, setError] = useState(false);

  // TODO: I am 99% sure we do not need different CardImage and CardImageSquare components
  if (error) {
    src = `./cardimages/${UNKNOWN_IMAGE}.webp`;
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
