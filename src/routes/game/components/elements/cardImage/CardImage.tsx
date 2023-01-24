import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './CardImage.module.css';

const UNKNOWN_IMAGE = 'Difficulties';

export interface CardImage {
  src: string;
  className?: string;
  //@ts-ignore Booleanish is allowed, right?
  draggable?: Booleanish;
}

export const CardImage = (props: CardImage) => {
  let src = props.src;
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
