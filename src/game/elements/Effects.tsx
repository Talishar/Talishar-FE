import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/Store';
import { clearPopUp, setPopUp } from '../../features/game/GameSlice';
import Player from '../../interface/Player';
import styles from '../ActiveEffects.module.css';
import Card from '../../features/Card';

export interface CardProp {
  card: Card;
  num?: number;
  name?: string;
}

function Effect(prop: CardProp) {
  const src = `https://www.fleshandbloodonline.com/FaBOnline/crops/${prop.card.cardNumber}_cropped.png`;
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const handleMouseEnter = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    dispatch(
      setPopUp({
        cardNumber: prop.card.cardNumber,
        xCoord: xCoord,
        yCoord: yCoord
      })
    );
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };
  return (
    <div
      className={styles.effect}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
      ref={ref}
    >
      <img src={src} className={styles.img} />
    </div>
  );
}

export default function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  const effects = useSelector((state: RootState) =>
    props.isPlayer ? state.game.playerOne.Effects : state.game.playerTwo.Effects
  );

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index) => {
        return <Effect card={card} key={index} />;
      })}
    </div>
  );
}
