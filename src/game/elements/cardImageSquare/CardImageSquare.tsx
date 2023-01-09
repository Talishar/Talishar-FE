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
  const [src, setSrc] = useState(props.src);
  const [error, setError] = useState(false);

  const handleImageError = () => {
    if (error) return;
    setError(true);
    setSrc(`./cardsquares/${UNKNOWN_IMAGE}.webp`);
  };

  return (
    <>
      <img src={src} className={styles.img} onError={handleImageError} />
    </>
  );
};

export default CardImageSquare;
