import React, { useState } from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './CardImageSquare.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

export interface CardImage {
  src: string;
  className?: string;
}

export const CardImageSquare = (props: CardImage) => {
  let src = props.src;
  const [error, setError] = useState(false);

  console.log(props.className);

  // TODO: can combine with CardImage component?
  if (error) {
    src = `./cardimages/${UNKNOWN_IMAGE}.webp`;
  }
  const handleImageError = () => {
    setError(true);
  };

  return (
    <>
      <img src={src} className={props.className} onError={handleImageError} />
    </>
  );
};

export default CardImageSquare;
