import React, { useRef } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { clearPopUp, setPopUp } from '../../features/game/GameSlice';
import { RootState } from '../../app/Store';
import Card from '../../features/Card';
import styles from './PlayerHand.module.css';

interface handCard {
  card?: Card;
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  handSize: number;
  cardIndex: number;
}

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

function PlayerHandCard(props: handCard) {
  const { card, cardIndex, handSize } = props;
  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }

  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const handleMouseEnter = () => {
    if (ref.current === null) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    console.log(rect);
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    dispatch(
      setPopUp({
        cardNumber: card.cardNumber,
        xCoord: xCoord,
        yCoord: yCoord
      })
    );
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };
  const degree = lerp(-15, 15, cardIndex / (handSize - 1));
  const rotationStyle = { transform: `rotate(${degree}deg)` };

  const src = `https://www.fleshandbloodonline.com/FaBOnline/WebpImages/${card.cardNumber}.webp`;

  return (
    <div className={styles.handCard}>
      <div
        className={styles.imgContainer}
        onMouseEnter={() => handleMouseEnter()}
        onMouseLeave={() => handleMouseLeave()}
        ref={ref}
        style={rotationStyle}
      >
        <img src={src} className={styles.img} />
      </div>
    </div>
  );
}

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };

  const handCards = useSelector(
    (state: RootState) => state.game.playerOne.Hand,
    shallowEqual
  );
  const arsenalCards = useSelector(
    (state: RootState) => state.game.playerOne.Arsenal,
    shallowEqual
  );
  const playableBanishedCards = useSelector(
    (state: RootState) => state.game.playerOne.Banish?.filter(isPlayable),
    shallowEqual
  );
  const playableGraveyardCards = useSelector(
    (state: RootState) => state.game.playerOne.Graveyard?.filter(isPlayable),
    shallowEqual
  );

  let lengthOfCards = 0;
  lengthOfCards += handCards !== undefined ? handCards.length : 0;
  lengthOfCards += arsenalCards !== undefined ? arsenalCards.length : 0;
  lengthOfCards +=
    playableBanishedCards !== undefined ? playableBanishedCards.length : 0;
  lengthOfCards +=
    playableGraveyardCards !== undefined ? playableGraveyardCards.length : 0;

  return (
    <div className={styles.handRow}>
      {handCards !== undefined &&
        handCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix}
            />
          );
        })}
      {arsenalCards !== undefined && handCards !== undefined && (
        <PlayerHandCard handSize={0} cardIndex={0} />
      )}
      {arsenalCards !== undefined &&
        arsenalCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix}
            />
          );
        })}
    </div>
  );
}
